import { Client } from '@opensearch-project/opensearch';

import { EsMapping } from './types';

export const getBody = ({ field, value, path, nested = false }) => {
  if (nested) {
    return {
      query: {
        bool: {
          must: [
            {
              nested: {
                path,
                query: { bool: { must: [{ match: { [field]: value } }] } },
              },
            },
          ],
        },
      },
    };
  }
  return {
    query: {
      bool: {
        must: [
          {
            match: { [field]: value },
          },
        ],
      },
    },
  };
};

export const getESAliases = async (esClient) => {
  const { body } = await esClient.cat.aliases({ format: 'json' });
  return body;
};

export const checkESAlias = (aliases, possibleAlias) =>
  aliases?.find((foundIndex = { alias: undefined }) => foundIndex.alias === possibleAlias)?.index;

export const getEsMappingProperties = async ({
  esIndex,
  esClient,
}: {
  esIndex: string;
  esClient: Client;
}): Promise<EsMapping> => {
  const aliases = await getESAliases(esClient);
  const alias = checkESAlias(aliases, esIndex);
  const response = await esClient.indices.getMapping({ index: alias });
  const mappingProperties = response?.body?.[alias]?.mappings.properties;
  return mappingProperties;
};

export const getEsMapping = async ({
  esIndex,
  esClient,
}: {
  esIndex: string;
  esClient: Client;
}): Promise<EsMapping> => {
  const response = await esClient.indices.getMapping({ index: esIndex });
  return response.body as unknown as EsMapping;
};

/**
 * Calls the `search` on the given elasticsearch.Client to get a single page of results.
 * @param {Object} esClient - an elasticsearch.Client object.
 * @param {String} index - the name of the index (or alias) on which to search.
 * @param {Object} query - an object containing the query,
 */
export const executeSearch = async (esClient, index, query) => {
  const searchParams = {
    index,
    body: {
      ...query,
      size: typeof query.size === 'number' ? query.size : 0,
    },
  };

  try {
    return esClient.search(searchParams);
  } catch (err) {
    console.error(`Error searching ES with params ${JSON.stringify(searchParams)}`, err);
    throw err;
  }
};
