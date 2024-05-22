import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import GraphQLJSON from './jsonType';

export const StatsType = new GraphQLObjectType({
  name: 'StatsType',
  description:
    // eslint-disable-next-line max-len
    'A multi-value metrics aggregation that computes stats over numeric values extracted from the aggregated documents.',
  // specifiedByUrl: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-stats-aggregation.html',
  fields: {
    max: { type: GraphQLFloat },
    min: { type: GraphQLFloat },
    count: { type: GraphQLInt },
    avg: { type: GraphQLFloat },
    sum: { type: GraphQLFloat },
  },
});

export const BucketType = new GraphQLObjectType({
  name: 'BucketType',
  description: 'Bucket aggregations',
  // specifiedByUrl: 'https://www.elastic.co/guide/en/elasticsearch/reference/7.17/search-aggregations-bucket.html',
  fields: {
    doc_count: { type: GraphQLInt },
    key: { type: GraphQLString },
    key_as_string: { type: GraphQLString },
    top_hits: {
      type: GraphQLJSON,
      args: {
        _source: { type: new GraphQLList(GraphQLString) },
        size: { type: GraphQLInt },
      },
    },
    filter_by_term: {
      type: GraphQLJSON,
      args: {
        filter: { type: GraphQLJSON },
      },
    },
  },
});

const AggregationsType = new GraphQLObjectType({
  name: 'AggregationsType',
  description: 'Allows one to get varied information from Bucket Aggregations',
  fields: {
    bucket_count: { type: GraphQLInt },
    buckets: {
      type: new GraphQLList(BucketType),
      args: { max: { type: GraphQLInt } },
    },
    cardinality: {
      type: GraphQLInt,
      args: {
        precision_threshold: { type: GraphQLInt },
      },
    },
  },
});

export const NumericAggregationsType = new GraphQLObjectType({
  name: 'NumericAggregationsType',
  description: 'Allows one to get varied information from Numeric Aggregations',
  fields: {
    stats: { type: StatsType },
    histogram: {
      type: AggregationsType,
      args: {
        interval: { type: GraphQLFloat },
      },
    },
  },
});

export default AggregationsType;
