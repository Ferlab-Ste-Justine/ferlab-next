import buildAggregations from '#src/legacy/buildAggregations';
import buildQuery from '#src/legacy/buildQuery';
import flattenAggregations from '#src/legacy/flattenAggregations';

import { DEFAULT_SORT, DEFAULT_SQON } from './constants';

const toGraphqlField = (acc, [a, b]) => ({
  ...acc,
  [a.replace(/\./g, '__')]: b,
});

const searchAggregations = async ({
  sqon = DEFAULT_SQON,
  nestedFields = DEFAULT_SORT,
  graphqlFields,
  aggregationsFilterThemselves,
  includeMissing = true,
  index,
  esClient,
  devMode = false,
}) => {
  const query = buildQuery({
    nestedFieldNames: nestedFields,
    filters: sqon,
  });

  const aggs = buildAggregations({
    query,
    sqon,
    graphqlFields,
    nestedFieldNames: nestedFields,
    aggregationsFilterThemselves,
  });

  if (devMode) {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    console.debug('[searchAggregations]', uniqueId, 'sqon:', JSON.stringify(sqon));
    console.debug('[searchAggregations]', uniqueId, 'buildQuery:', JSON.stringify(query));
    console.debug('[searchAggregations]', uniqueId, 'buildAggregations:', JSON.stringify(aggs));
  }

  const body = Object.keys(query || {}).length ? { query, aggs } : { aggs };

  const result = await esClient.search({
    index,
    // size: 0,
    // from: 0,
    track_total_hits: true,
    body,
  });

  const aggregations = flattenAggregations({
    aggregations: result.body.aggregations,
    includeMissing,
  });

  return Object.entries(aggregations).reduce(toGraphqlField, {});
};

export default searchAggregations;
