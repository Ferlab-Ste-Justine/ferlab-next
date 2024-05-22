import { createColumnSetState } from '#src/legacy/columnState';

const columnStateResolver = async (args, type, esClient) => {
  const result = await createColumnSetState({
    esIndex: type.extensions.esIndex,
    graphqlField: type.name,
    esClient,
  });
  return result;
};

export default columnStateResolver;
