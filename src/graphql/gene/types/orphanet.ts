import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

export const OrphanetType = new GraphQLObjectType({
  name: 'OrphanetType',
  fields: () => ({
    id: { type: GraphQLString },
    disorder_id: { type: GraphQLFloat },
    inheritance: { type: new GraphQLList(GraphQLString) },
    panel: { type: GraphQLString },
  }),
});

const OrphanetEdgesType = new GraphQLObjectType({
  name: 'OrphanetEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: OrphanetType },
  }),
});

const OrphanetHitsType = new GraphQLObjectType({
  name: 'OrphanetHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(OrphanetEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

export const OrphanetsType = new GraphQLObjectType({
  name: 'OrphanetsType',
  fields: () => ({
    hits: {
      type: OrphanetHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, OrphanetType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default OrphanetsType;
