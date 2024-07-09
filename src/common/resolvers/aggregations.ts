//FIXME https://github.com/robrichard/graphql-fields#deprecation-notice
import getFields from 'graphql-fields';

import searchAggregations from '#src/elasticsearch/searchAggregations';

const aggsResolver = async (args, info, type, esClient, devMode = false) => {
  const graphqlFields = getFields(info, {}, { processArguments: true });
  const nestedFields = type.extensions.nestedFields || [];
  const index = type.extensions.esIndex || '';

  return searchAggregations({
    sqon: args.filters,
    aggregationsFilterThemselves: args.aggregations_filter_themselves,
    includeMissing: args.include_missing,
    graphqlFields,
    nestedFields,
    index,
    esClient,
    devMode,
  });
};

export default aggsResolver;
