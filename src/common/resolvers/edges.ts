import get from 'lodash/get';

const edgesResolver = (parent) => {
  const { edges = [], args } = parent;

  const edgesWithSearchAfter = edges.map((node) => {
    const searchAfter =
      args?.sort?.map(({ field }) => {
        const valueFound = get(node, `${field}`);
        return Number.isInteger(valueFound) && !Number.isSafeInteger(valueFound)
          ? // TODO: figure out a way to inject ES_CONSTANTS in here from @arranger/middleware
            // ? ES_CONSTANTS.ES_MAX_LONG //https://github.com/elastic/elasticsearch-js/issues/662
            `-9223372036854775808` //https://github.com/elastic/elasticsearch-js/issues/662
          : valueFound;
      }) || [];

    return {
      searchAfter,
      node,
    };
  });

  return edgesWithSearchAfter;
};

export default edgesResolver;
