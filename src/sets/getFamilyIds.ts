import { Client } from '@opensearch-project/opensearch';

import { executeSearch } from '../elasticsearch/utils';

interface IFileInfo {
  data_type: string;
  family_id: string;
}

/** Get IFileInfo: files data_types and family_ids */
const getFilesInfo = async (
  fileIds: string[],
  es: Client,
  maxSetContentSize: number,
  esFileIndex: string,
  fileIdField: string
): Promise<IFileInfo[]> => {
  const esRequest = {
    query: { bool: { must: [{ terms: { [fileIdField]: fileIds, boost: 0 } }] } },
    _source: [fileIdField, 'data_type', 'participants.family_id'],
    sort: [{ data_type: { order: 'asc' } }],
    size: maxSetContentSize,
  };
  const results = await executeSearch(es, esFileIndex, esRequest);
  const hits = results?.body?.hits?.hits || [];
  const sources = hits.map((hit) => hit._source);
  const filesInfos = [];
  sources?.forEach((source) => {
    source.participants?.forEach((participant) => {
      if (
        participant.family_id &&
        !filesInfos.find((f) => f.family_id === participant.family_id && f.data_type === source.data_type)
      ) {
        filesInfos.push({
          data_type: source.data_type,
          family_id: participant.family_id || '',
        });
      }
    });
  });
  return filesInfos;
};

/** for each filesInfos iteration, get files from file.participants.family_id and file.data_type */
const getFilesIdsMatched = async (
  filesInfos: IFileInfo[],
  es: Client,
  maxSetContentSize: number,
  esFileIndex: string,
  fileIdField: string
): Promise<string[]> => {
  const filesIdsMatched = [];
  const results = await Promise.all(
    filesInfos.map((info) => {
      const esRequest = {
        query: {
          bool: {
            must: [
              { terms: { data_type: [info.data_type], boost: 0 } },
              {
                nested: {
                  path: 'participants',
                  query: { bool: { must: [{ match: { ['participants.family_id']: info.family_id } }] } },
                },
              },
            ],
          },
        },
        _source: [fileIdField],
        size: maxSetContentSize,
      };
      return executeSearch(es, esFileIndex, esRequest);
    })
  );

  for (const res of results) {
    const hits = res?.body?.hits?.hits || [];
    const sources = hits.map((hit) => hit._source);
    filesIdsMatched.push(...sources.map((s) => s[fileIdField]));
  }

  return filesIdsMatched;
};

/**
 * Complete fileIds with ids from the families that match the data_type
 *
 * @param {Client} esClient
 * @param {string[]} fileIds
 * @param {number} maxSetContentSize
 * @param {string} esFileIndex
 * @param {string} fileIdField ES field holding the file id (e.g. `stable_file_id`), defaults to `file_id`
 * @returns {Promise<string[]>}
 */
const getFamilyIds = async (
  esClient: Client,
  fileIds: string[],
  maxSetContentSize: number,
  esFileIndex: string,
  fileIdField = 'file_id'
): Promise<string[]> => {
  const filesInfos = await getFilesInfo(fileIds, esClient, maxSetContentSize, esFileIndex, fileIdField);
  const filesIdsMatched = await getFilesIdsMatched(filesInfos, esClient, maxSetContentSize, esFileIndex, fileIdField);
  const newFileIds = [...new Set([...fileIds, ...filesIdsMatched])];

  return newFileIds;
};

export default getFamilyIds;
