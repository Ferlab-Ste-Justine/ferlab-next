import { Client } from '@opensearch-project/opensearch';
import { GraphQLSchema } from 'graphql';
import get from 'lodash/get';

import { maxSetContentSize } from '../config';
import runQuery from '../graphql/runQuery';
import { SetSqon, Sort } from '../sets/types';

export const searchSqon = async (
  sqon: SetSqon,
  type: string,
  sort: Sort[],
  idField: string,
  esClient: Client,
  schema: GraphQLSchema
): Promise<string[]> => {
  const results = await runQuery({
    esClient,
    schema,
    query: `
      query($sqon: JSON, $sort: [Sort], $first: Int) {
        ${type} {
          hits(filters: $sqon, sort: $sort, first: $first) {
            edges {
              node {
                ${idField}
              }
            }
          }
        }
      }
    `,
    variables: { sqon, sort, first: maxSetContentSize },
  });

  if (get(results, 'errors', undefined)) {
    throw new Error(get(results, 'errors', undefined));
  }

  return get(results, `data.${type}.hits.edges`, []).map((edge) => edge.node[idField]);
};

export default searchSqon;
