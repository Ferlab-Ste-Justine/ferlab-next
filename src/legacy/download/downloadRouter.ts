import { Router, urlencoded } from 'express';
import defaults from 'lodash/defaults';
import { pack as tarPack } from 'tar-stream';
import zlib from 'zlib';

import { IQueryContext } from '#src/legacy/types';

import dataToExportFormat from '../utils/dataToExportFormat';
import getAllData from '../utils/getAllData';

const convertDataToExportFormat =
  ({ context, fileType }) =>
  async (args) =>
    (
      await getAllData({
        context,
        ...args,
      })
    ).pipe(await dataToExportFormat({ ...args, context, fileType }));

const getFileStream = async ({ chunkSize, context, file, fileType, mock }) => {
  const exportArgs = defaults(file, { chunkSize, fileType, mock });

  return convertDataToExportFormat({ context, fileType })({
    ...exportArgs,
    mock,
  });
};

const multipleFiles = async ({ chunkSize, context, files, mock }) => {
  const pack = tarPack();

  Promise.all(
    files.map(
      (file, i) =>
        // TODO: this async as the executor of a Promise is smelly
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async (resolve, reject) => {
          // pack needs the size of the stream. We don't know that until we get all the data.
          // This collects all the data before adding it.
          let data = '';
          const fileStream = await getFileStream({
            chunkSize,
            context,
            file,
            fileType: file.fileType,
            mock,
          });

          fileStream.on('data', (chunk) => (data += chunk));
          fileStream.on('end', () => {
            pack.entry({ name: file.fileName || `file-${i + 1}.tsv` }, data, function (err) {
              if (err) {
                reject(err);
              } else {
                resolve(null);
              }
            });
          });
        })
    )
  ).then(() => pack.finalize());

  /** NOTE from zlib's maintainers:
   * (This library) is only intended for small (< 128 KB) data
   * that you already have buffered. It is not meant for input/output streams.
   * -- Found at: https://www.npmjs.com/package/zlib
   *
   * TODO: may have to find one that manages larger buffer sizes.
   * Must do testing for this
   */
  return pack.pipe(zlib.createGzip());
};

export const dataStream = async ({ context, params }) => {
  const { chunkSize, files, fileName = 'file.tar.gz', fileType = 'tsv', mock } = params;

  if (files?.length > 0) {
    return files.length === 1
      ? {
          contentType: 'text/plain',
          output: await getFileStream({
            chunkSize,
            context,
            file: files[0],
            fileType: files[0].fileType || fileType,
            mock,
          }),
          responseFileName: files[0].fileName || fileName,
        }
      : {
          contentType: 'application/gzip',
          output: multipleFiles({ chunkSize, context, files, mock }),
          responseFileName: fileName.replace(/(\.tar(\.gz)?)?$/, '.tar.gz'), // make sure file ends with '.tar.gz'
        };
  }

  console.warn('no files defined to download');
  throw new Error('files array was missing or empty');
};

const downloadRouter = (resolveContext) => {
  const router = Router();

  router.use(urlencoded({ extended: true }));

  router.post('/', async (req, res) => {
    try {
      console.time('download');

      const context: IQueryContext = await resolveContext(req);
      const { params } = req.body;
      const { output, responseFileName, contentType } = await dataStream({
        context,
        params: JSON.parse(params),
      });

      res.set('Content-Type', contentType);
      res.set('Content-disposition', `attachment; filename=${responseFileName}`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      output.pipe(res).on('finish', () => {
        console.timeEnd('download');
      });
    } catch (err) {
      console.error(err);
      console.timeEnd('download');

      res.status(400).send(err?.message || err?.details || 'An unknown error occurred.');
    }
  });

  // if (enableAdmin) {
  //   router.get('/fields', async (req, res) => {
  //     // all the fields, as flattened from the ES mapping
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     const { fieldsFromMapping } = req.context;
  //
  //     res.json(fieldsFromMapping);
  //   });
  // }

  return router;
};

export default downloadRouter;
