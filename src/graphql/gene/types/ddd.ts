import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

const DddType = new GraphQLObjectType({
  name: 'DddType',
  fields: () => ({
    disease_name: { type: GraphQLString },
  }),
});

const DddEdgesType = new GraphQLObjectType({
  name: 'DddEdgesType',
  fields: () => ({
    searchAfter: { type: new GraphQLList(GraphQLInt) },
    node: { type: DddType },
  }),
});

const DddHitsType = new GraphQLObjectType({
  name: 'DddHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(DddEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

const DddsType = new GraphQLObjectType({
  name: 'DddsType',
  fields: () => ({
    hits: {
      type: DddHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, DddType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default DddsType;
