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
}) => {
  const query = buildQuery({
    nestedFieldNames: nestedFields,
    filters: sqon,
  });

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
