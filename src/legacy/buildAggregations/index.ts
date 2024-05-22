import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { opSwitch } from '../buildQuery';
import normalizeFilters from '../buildQuery/normalizeFilters';
import {
  AGGS_WRAPPER_FILTERED,
  AGGS_WRAPPER_GLOBAL,
  AGGS_WRAPPER_NESTED,
  ES_BOOL,
  ES_NESTED,
  ES_QUERY,
} from '../constants';
import createFieldAggregation from './createFieldAggregation';
import getNestedSqonFilters from './getNestedSqonFilters';
import injectNestedFiltersToAggs from './injectNestedFiltersToAggs';

function createGlobalAggregation({ field, aggregation }) {
  return {
    [`${field}:${AGGS_WRAPPER_GLOBAL}`]: { global: {}, aggs: aggregation },
  };
}

function createFilteredAggregation({ field, filter, aggregation }) {
  return Object.keys(filter || {}).length
    ? { [`${field}:${AGGS_WRAPPER_FILTERED}`]: { filter, aggs: aggregation } }
    : aggregation;
}

function removeFieldFromQuery({ field, query }) {
  const nested = get(query, ES_NESTED);
  const nestedQuery = get(nested, ES_QUERY);
  const bool = get(query, ES_BOOL);

  if (['terms', 'range'].some((k) => get(query, [k, field])) || get(query, ['exists', 'field']) === field) {
    return null;
  } else if (nestedQuery) {
    const cleaned = removeFieldFromQuery({ field, query: nestedQuery });
    return cleaned && { ...query, [ES_NESTED]: { ...nested, [ES_QUERY]: cleaned } };
  } else if (bool) {
    const filtered = Object.entries(bool).reduce((acc, [type, values]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const filteredValues = values.map((value) => removeFieldFromQuery({ field, query: value })).filter(Boolean);

      if (filteredValues.length > 0) {
        acc[type] = filteredValues;
      }
      return acc;
    }, {});

    return Object.keys(filtered).length > 0 ? { [ES_BOOL]: filtered } : null;
  } else {
    return query;
  }
}

function getNestedPathsInField({ field = '', nestedFieldNames = [] }) {
  return field
    .split('.')
    .map((s, i, arr) => arr.slice(0, i + 1).join('.'))
    .filter((p) => nestedFieldNames.includes(p));
}

function wrapWithFilters({ field, query, aggregationsFilterThemselves, aggregation }) {
  if (!aggregationsFilterThemselves) {
    const cleanedQuery = removeFieldFromQuery({ field, query });
    // TODO: better way to figure out that the field wasn't found
    if (!isEqual(cleanedQuery || {}, query || {})) {
      return createGlobalAggregation({
        field,
        aggregation: createFilteredAggregation({
          field,
          filter: cleanedQuery,
          aggregation,
        }),
      });
    }
  }
  return aggregation;
}

/**
 * graphqlFields: output from `graphql-fields` (https://github.com/robrichard/graphql-fields)
 */
export default function ({ aggregationsFilterThemselves, graphqlFields, nestedFieldNames, query, sqon }) {
  const normalizedSqon = normalizeFilters(sqon);
  const aggs = Object.entries(graphqlFields).reduce((aggregations, [fieldKey, graphqlField]) => {
    const field = fieldKey.replace(/__/g, '.');
    const nestedPaths = getNestedPathsInField({ field, nestedFieldNames });
    const contentsFiltered = (normalizedSqon?.content || []).filter((c) =>
      aggregationsFilterThemselves
        ? c.content?.field?.startsWith(nestedPaths)
        : c.content?.field?.startsWith(nestedPaths) && c.content?.field !== field
    );
    const termFilters = contentsFiltered.map((filter) => opSwitch({ nestedFieldNames: [], filter }));

    const fieldAggregation = createFieldAggregation({
      field,
      graphqlField,
      isNested: !!nestedPaths.length,
      termFilters,
    });

    const aggregation = nestedPaths.reverse().reduce(
      (aggs, path) => ({
        [`${field}:${AGGS_WRAPPER_NESTED}`]: { nested: { path }, aggs },
      }),
      fieldAggregation
    );

    return Object.assign(
      aggregations,
      wrapWithFilters({
        aggregation,
        aggregationsFilterThemselves,
        field,
        query,
      })
    );
  }, {});

  const nestedSqonFilters = getNestedSqonFilters({
    nestedFieldNames,
    sqon: normalizedSqon,
  });

  const filteredAggregations = injectNestedFiltersToAggs({
    aggregationsFilterThemselves,
    aggs,
    nestedSqonFilters,
  });

  return filteredAggregations;
}
