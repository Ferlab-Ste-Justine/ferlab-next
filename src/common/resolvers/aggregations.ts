//FIXME https://github.com/robrichard/graphql-fields#deprecation-notice
import getFields from 'graphql-fields';

import searchAggregations from '#src/elasticsearch/searchAggregations';
import { IContext } from '#src/types';

const aggsResolver = async (args, info, type, context: IContext) => {
  const graphqlFields = getFields(info, {}, { processArguments: true });
  const nestedFields = type.extensions.nestedFields || [];
  const esIndex = context.getESIndexByIndex(type.name) || '';
  const esClient = context.esClient;

  return searchAggregations({
    sqon: args.filters,
    aggregationsFilterThemselves: args.aggregations_filter_themselves,
    includeMissing: args.include_missing,
    graphqlFields,
    nestedFields,
    index: esIndex,
    esClient,
  });
};

export default aggsResolver;
