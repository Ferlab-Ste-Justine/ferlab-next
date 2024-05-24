import flatMap from 'lodash/flatMap';
import get from 'lodash/get';
import max from 'lodash/max';
import min from 'lodash/min';

import {
  ALL_OP,
  AND_OP,
  BETWEEN_OP,
  ES_ARRANGER_SET_INDEX,
  ES_ARRANGER_SET_TYPE,
  ES_BOOL,
  ES_MUST,
  ES_MUST_NOT,
  ES_NESTED,
  ES_QUERY,
  ES_WILDCARD,
  FILTER_OP,
  GT_OP,
  GTE_OP,
  IN_OP,
  LT_OP,
  LTE_OP,
  MISSING,
  NOT_IN_OP,
  NOT_OP,
  OR_OP,
  REGEX,
  SET_ID,
  SOME_NOT_IN_OP,
} from '../constants';
import {
  isNested,
  mergePath,
  readPath,
  toEsRangeValue,
  wrapMust,
  wrapMustNot,
  wrapNested,
  wrapShould,
} from '../utils/esFilter';
import normalizeFilters from './normalizeFilters';

const wrapFilter = ({ esFilter, nestedFieldNames, filter, isNot }: any) =>
  filter?.content?.field
    ?.split('.')
    .slice(0, -1)
    .map((p, i, segments) => segments.slice(0, i + 1).join('.'))
    .filter((p) => nestedFieldNames?.includes?.(p))
    .reverse()
    ?.reduce((esFilter, path) => wrapNested(esFilter, path), isNot ? wrapMustNot(esFilter) : esFilter);

function getRegexFilter({ nestedFieldNames, filter }) {
  const {
    op,
    content: {
      field,
      value: [value],
    },
  } = filter;
  const esFilter = wrapFilter({
    filter,
    nestedFieldNames,
    esFilter: { regexp: { [field]: value.replace('*', '.*') } },
    isNot: NOT_IN_OP === op,
  });

  return op === SOME_NOT_IN_OP ? wrapMustNot(esFilter) : esFilter;
}

function getTermFilter({ nestedFieldNames, filter }) {
  const {
    op,
    content: { value, field },
  } = filter;
  const esFilter = wrapFilter({
    filter,
    nestedFieldNames,
    esFilter: { terms: { [field]: value.map((item) => item || ''), boost: 0 } },
    isNot: NOT_IN_OP === op,
  });

  return op === SOME_NOT_IN_OP ? wrapMustNot(esFilter) : esFilter;
}

function getFuzzyFilter({ nestedFieldNames, filter }) {
  const { content } = filter;
  const { value, fields } = content;

  // group queries by their nesting level
  const sortedNested = nestedFieldNames?.slice().sort((a, b) => b.length - a.length);
  const nestedMap =
    fields?.reduce((acc, field) => {
      const group = sortedNested?.find((y) => field?.includes?.(y)) || '';
      if (acc[group]) {
        acc[group].push(field);
      } else {
        acc[group] = [field];
      }
      return acc;
    }, {}) || {};

  // construct one multi match per nested group
  return wrapShould(
    Object.values(nestedMap).map((fieldNames: any) =>
      wrapFilter({
        filter: { ...filter, content: { ...content, field: fieldNames[0] } },
        nestedFieldNames,
        esFilter: wrapShould(
          fieldNames.map((field) => ({
            [ES_WILDCARD]: {
              [field]: {
                value: `${value}`,
                case_insensitive: true,
              },
            },
          }))
        ),
      })
    )
  );
}

function getMissingFilter({ nestedFieldNames, filter }) {
  const {
    content: { field },
    op,
  } = filter;
  return wrapFilter({
    esFilter: { exists: { field, boost: 0 } },
    nestedFieldNames,
    filter,
    isNot: op === IN_OP,
  });
}

function getRangeFilter({ nestedFieldNames, filter }) {
  const {
    op,
    content: { field, value },
  } = filter;
  return wrapFilter({
    filter,
    nestedFieldNames,
    esFilter: {
      range: {
        [field]: {
          boost: 0,
          [op]: toEsRangeValue([GT_OP, GTE_OP]?.includes?.(op) ? max(value) : min(value)),
        },
      },
    },
  });
}

function collapseNestedFilters({ esFilter, bools }) {
  const filterIsNested = isNested(esFilter);
  const basePath = [...(filterIsNested ? [ES_NESTED, ES_QUERY] : []), ES_BOOL];
  const path: any = [ES_MUST, ES_MUST_NOT].map((p) => [...basePath, p]).find((path) => get(esFilter, path));

  const found =
    path && bools.find((bool) => (filterIsNested ? readPath(bool) === readPath(esFilter) : get(bool, path)));

  return [
    ...bools.filter((bool) => bool !== found),
    found
      ? mergePath(
          found,
          path,
          filterIsNested
            ? collapseNestedFilters({
                esFilter: get(esFilter, path)[0],
                bools: get(found, path, []),
              })
            : [...get(found, path), ...get(esFilter, path)]
        )
      : esFilter,
  ];
}

const wrappers = {
  [AND_OP]: wrapMust,
  [OR_OP]: wrapShould,
  [NOT_OP]: wrapMustNot,
};
function getGroupFilter({ nestedFieldNames, filter: { content, op, pivot } }) {
  const applyBooleanWrapper = wrappers[op];
  const esFilters = content.map((filter) => opSwitch({ nestedFieldNames, filter }));
  const isNested = !!esFilters[0]?.nested;
  if (isNested && esFilters.map((f) => f.nested?.path)?.includes?.(pivot)) {
    const flattned = esFilters?.reduce(
      (bools, esFilter) =>
        op === AND_OP || op === NOT_OP ? collapseNestedFilters({ esFilter, bools }) : [...bools, esFilter],
      []
    );
    return applyBooleanWrapper(flattned);
  } else {
    return applyBooleanWrapper(esFilters);
  }
}

function getSetFilter({ nestedFieldNames, filter, filter: { content, op } }) {
  return wrapFilter({
    isNot: op === NOT_IN_OP,
    filter,
    nestedFieldNames,
    esFilter: {
      terms: {
        boost: 0,
        [content.field]: {
          index: ES_ARRANGER_SET_INDEX,
          type: ES_ARRANGER_SET_TYPE,
          id: flatMap([content.value])[0].replace('set_id:', ''),
          path: 'ids',
        },
      },
    },
  });
}

const getBetweenFilter = ({ nestedFieldNames, filter }) => {
  const {
    content: { field, value },
  } = filter;
  return wrapFilter({
    filter,
    nestedFieldNames,
    esFilter: {
      range: {
        [field]: {
          boost: 0,
          [GTE_OP]: min(value),
          [LTE_OP]: max(value),
        },
      },
    },
  });
};

export const opSwitch = ({ nestedFieldNames, filter }: any) => {
  const {
    op,
    pivot,
    content: { value },
  } = filter;
  // we need a way to handle object fields before the following error is valid
  // if (pivot && pivot !== '.' && !nestedFieldNames.includes(pivot)) {
  //   throw new Error(`Invalid pivot field "${pivot}", not a nested field`);
  // }
  if ([OR_OP, AND_OP, NOT_OP].includes(op)) {
    return getGroupFilter({ nestedFieldNames, filter });
  } else if ([IN_OP, NOT_IN_OP, SOME_NOT_IN_OP].includes(op)) {
    if (`${value[0]}`.includes(REGEX)) {
      return getRegexFilter({ nestedFieldNames, filter });
    } else if (`${value[0]}`.includes(SET_ID)) {
      return getSetFilter({ nestedFieldNames, filter });
    } else if (`${value[0]}`.includes(MISSING)) {
      return getMissingFilter({ nestedFieldNames, filter });
    } else {
      return getTermFilter({ nestedFieldNames, filter });
    }
  } else if ([ALL_OP].includes(op)) {
    return getGroupFilter({
      nestedFieldNames,
      filter: {
        op: AND_OP,
        pivot: pivot || '.',
        content: filter.content.value.map((v) => ({
          op: IN_OP,
          content: {
            field: filter.content.field,
            value: [v],
          },
        })),
      },
    });
  } else if ([GT_OP, GTE_OP, LT_OP, LTE_OP].includes(op)) {
    return getRangeFilter({ nestedFieldNames, filter });
  } else if ([BETWEEN_OP].includes(op)) {
    return getBetweenFilter({ nestedFieldNames, filter });
  } else if (FILTER_OP === op) {
    return getFuzzyFilter({ nestedFieldNames, filter });
  } else {
    throw new Error('unknown op');
  }
};

export default function ({ nestedFieldNames = [], filters: rawFilters }) {
  if (Object.keys(rawFilters || {}).length === 0) return {};

  return opSwitch({
    nestedFieldNames,
    filter: normalizeFilters(rawFilters),
  });
}
