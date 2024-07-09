import searchHits from '#src/elasticsearch/searchHits';

const hitsResolver = async (parent, args, type, esClient, devMode = false) => {
  if (Array.isArray(parent)) {
    return { total: parent.length || 0, edges: parent, args };
  }

  const nestedFields = type.extensions.nestedFields || [];
  const index = type.extensions.esIndex || '';

  const result = await searchHits({
    sort: args.sort,
    size: args.first,
    sqon: args.filters,
    offset: args.offset,
    searchAfter: args.searchAfter,
    nestedFields,
    index,
    esClient,
    devMode,
  });

  const edges =
    result?.hits?.map((hit) => ({
      id: hit._id,
      _sort: hit.sort,
      ...hit._source,
    })) || [];

  return { total: result.total || 0, edges, args };
};

export default hitsResolver;
