const edgesResolver = (parent) => {
  const { edges = [] } = parent;

  const edgesWithSearchAfter = edges.map((node) => {
    const searchAfter =
      node?._sort?.map((value) => {
        return Number.isInteger(value) && !Number.isSafeInteger(value)
          ? // TODO: figure out a way to inject ES_CONSTANTS in here from @arranger/middleware
            // ? ES_CONSTANTS.ES_MAX_LONG //https://github.com/elastic/elasticsearch-js/issues/662
            `-9223372036854775808` //https://github.com/elastic/elasticsearch-js/issues/662
          : value;
      }) || [];

    return {
      searchAfter,
      node,
    };
  });

  return edgesWithSearchAfter;
};

export default edgesResolver;
