import { Client } from '@opensearch-project/opensearch';
import { graphql, GraphQLSchema } from 'graphql';
import { ExecutionResult } from 'graphql/execution/execute';

import { SetSqon, Sort } from '#src/sets/types';

interface IrunQuery {
  query: string;
  variables: {
    sqon?: SetSqon;
    sort?: Sort[];
    first?: number;
  };
  esClient: Client;
  schema: GraphQLSchema;
}

const runQuery = ({ query, variables, esClient, schema }: IrunQuery): Promise<ExecutionResult> =>
  graphql({
    schema,
    contextValue: {
      esClient,
      schema,
    },
    source: query,
    variableValues: variables,
  });

export default runQuery;
