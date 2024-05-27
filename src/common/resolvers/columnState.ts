import { Client } from '@opensearch-project/opensearch';

import { createColumnSetState } from '#src/legacy/columnState';
import { I_ColumnSetState } from '#src/legacy/columnState/types';
import { IContext } from '#src/types';

const columnStateResolver = async (type, context: IContext) => {
  const esIndex: string = context.getESIndexByIndex(type.name) || '';
  const esClient: Client = context.esClient;
  const result: I_ColumnSetState = await createColumnSetState({
    esIndex,
    graphqlField: type.name,
    esClient,
  });
  return result;
};

export default columnStateResolver;
