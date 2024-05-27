import searchHits from '#src/elasticsearch/searchHits';
import { IContext } from '#src/types';

const hitsResolver = async (parent, args, type, context: IContext) => {
  if (Array.isArray(parent)) {
    return { total: parent.length || 0, edges: parent };
  }

  const nestedFields = type.extensions.nestedFields || [];
  const esIndex = context.getESIndexByIndex(type.name) || '';
  const esClient = context.esClient;

  const result = await searchHits({
    sort: args.sort,
    size: args.first,
    sqon: args.filters,
    offset: args.offset,
    searchAfter: args.searchAfter,
    nestedFields,
    index: esIndex,
    esClient,
  });

  return { total: result.total || 0, edges: result.hits || [] };
};

export default hitsResolver;
