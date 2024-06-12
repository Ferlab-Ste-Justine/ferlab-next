import { PassThrough } from 'stream';

import { getEsMapping, getEsMappingProperties } from '#src/elasticsearch/utils';

import runQuery from '../../graphql/runQuery';
import buildQuery from '../buildQuery';
import { getExtendedFields } from '../mapping/extendMapping';
import esToSafeJsInt from '../utils/esToSafeJsInt';

/** variables used as default value */
const DOWNLOAD_STREAM_BUFFER_SIZE = 2000;
const MAX_DOWNLOAD_ROWS = 10000;
const ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS = false;

/**
 * @param chunkSize
 * @param context
 * @param maxRows (Optional. Default: null) Limits the maximum number of rows to include in the results.
 * If zero (0) is given, it will include up to Server's own limit (Default: 100).
 * -- This props may be ignored depending on Server configs.
 * @param sort
 * @param sqon
 * @param index
 */
const getAllData = async ({ chunkSize = DOWNLOAD_STREAM_BUFFER_SIZE, context, maxRows, sort = [], sqon, index }) => {
  const { esClient, schema, getESIndexByIndex } = context;
  const esIndex = getESIndexByIndex(index);
  const extendedFields = await getExtendedFields(context, index);

  const stream = new PassThrough({ objectMode: true });

  //todo: check if _id is still present for the concat
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const esSort = sort.map(({ field, order }) => ({ [field]: order })).concat({ _id: 'asc' });
  const nestedFieldNames = extendedFields.filter(({ type }) => type === 'nested').map(({ field }) => field);

  const query = buildQuery({ nestedFieldNames, filters: sqon });

  runQuery({
    query: `
      query ($sqon: JSON) {
        ${index} {
          hits(filters: $sqon) {
            total
          }
        }
      }
    `,
    variables: { sqon },
    schema,
    esClient,
  })
    .then((res) => {
      const data = res.data;
      const maxDownloadRows = context.MAX_DOWNLOAD_ROWS || MAX_DOWNLOAD_ROWS;
      const allowCustomMax = context.ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS || ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS;
      const maxHits = allowCustomMax ? maxRows || maxDownloadRows : maxDownloadRows;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const hitsCount = data?.[index]?.hits?.total || 0;
      const total = maxHits ? Math.min(hitsCount, maxHits) : hitsCount; // i.e. 'maxHits == 0' => hitCounts
      const steps = Array(Math.ceil(total / chunkSize)).fill(null);

      // async reduce because each cycle is dependent on result of the previous
      return steps.reduce(async (previous, next, stepNumber) => {
        const previousHits = await previous;
        const timerLabel = `EsQuery, step ${stepNumber + 1}`;

        console.time(timerLabel);
        const hits = await esClient
          .search({
            index: esIndex,
            size: maxHits ? Math.min(maxHits, chunkSize) : chunkSize,
            body: {
              sort: esSort,
              ...(previousHits
                ? {
                    search_after: previousHits[previousHits.length - 1]?.sort?.map(esToSafeJsInt),
                  }
                : {}),
              ...(Object.entries(query).length ? { query } : {}),
            },
          })
          .then(({ body }) => body.hits.hits);
        console.timeEnd(timerLabel);
        stream.write({ hits: hits.map((hit) => hit?._source), total });
        return hits;
      }, Promise.resolve());
    })
    .then(() => stream.end())
    .catch((err) => {
      console.error('error', err);
    });

  return stream;
};

export default getAllData;
