import buildQuery from '#src/legacy/buildQuery';

import { DEFAULT_HITS_SIZE, DEFAULT_SORT, DEFAULT_SQON } from './constants';

const simpleSorter = (xs) => (xs || []).map((x) => ({ [x.field]: x.order }));

const searchHits = async ({
  sqon = DEFAULT_SQON,
  sort = DEFAULT_SORT,
  nestedFields = [],
  index,
  size = DEFAULT_HITS_SIZE,
  searchAfter,
  offset = 0,
  esClient,
  devMode = false,
}) => {
  const query = buildQuery({
    nestedFieldNames: nestedFields,
    filters: sqon,
  });

  if (devMode) {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    console.debug('[searchHits]', uniqueId, 'sqon:', JSON.stringify(sqon));
    console.debug('[searchHits]', uniqueId, 'buildQuery:', JSON.stringify(query));
  }

  const body = {
    sort: simpleSorter(sort),
    query: query,
    search_after: searchAfter,
  };

  const result = await esClient.search({
    index,
    size,
    from: offset,
    //optimize? if total not present in the query, turn to false?
    track_total_hits: true,
    body,
  });

  const hits = result.body?.hits || {};

  return {
    total: hits?.total?.value,
    hits: hits?.hits || [],
  };
};

export default searchHits;
