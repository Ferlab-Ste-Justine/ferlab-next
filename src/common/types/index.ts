import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import GraphQLJSON from './jsonType';
import { SortType } from './sortType';

export const hitsArgsType = {
  first: { type: GraphQLInt },
  offset: { type: GraphQLInt },
  sort: { type: new GraphQLList(SortType) },
  searchAfter: { type: GraphQLJSON },
  filters: { type: GraphQLJSON },
};

export const aggregationsArgsType = {
  sqon: { type: GraphQLJSON },
  aggregations_filter_themselves: { type: GraphQLBoolean },
  include_missing: { type: GraphQLBoolean },
  filters: { type: GraphQLJSON },
};

export const AggsStateType = new GraphQLObjectType({
  name: 'AggsStateType',
  fields: () => ({
    timestamp: { type: GraphQLString },
    state: { type: new GraphQLList(AggsStateType) },
  }),
});

export const MatchBoxFieldType = new GraphQLObjectType({
  name: 'MatchBoxFieldType',
  fields: () => ({
    displayName: { type: GraphQLString },
    field: { type: GraphQLString },
    keyField: { type: GraphQLString },
    searchFields: { type: new GraphQLList(GraphQLString) },
    isActive: { type: GraphQLBoolean },
  }),
});

export const MatchBoxStateType = new GraphQLObjectType({
  name: 'MatchBoxStateType',
  fields: () => ({
    timestamp: { type: GraphQLString },
    state: { type: new GraphQLList(MatchBoxFieldType) },
  }),
});

//todo: rm aggregationsType for AggregationsType or skip it with GraphQLJSON
export const aggregationsType = GraphQLJSON;

export { default as AggregationsType } from './aggregationsType';
export { default as ColumnsStateType } from './columnsStateType';
export { default as GraphQLJSON } from './jsonType';
