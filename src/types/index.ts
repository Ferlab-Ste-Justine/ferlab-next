import { Client } from '@opensearch-project/opensearch';
import { GraphQLSchema } from 'graphql';

import { I_ExtendedMappingSetFieldInput } from '#src/legacy/types';

export interface IContext {
  auth: string;
  schema: GraphQLSchema;
  esClient: Client;
  getExtendedMappingByIndex: (graphqlIndex: string) => I_ExtendedMappingSetFieldInput[];
  getESIndexByIndex: (graphqlIndex: string) => string;
  MAX_DOWNLOAD_ROWS: number;
  ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS: boolean;
}
