import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

export const OmimType = new GraphQLObjectType({
  name: 'OmimType',
  fields: () => ({
    id: { type: GraphQLString },
    inheritance: { type: new GraphQLList(GraphQLString) },
    inheritance_code: { type: new GraphQLList(GraphQLString) },
    name: { type: GraphQLString },
    omim_id: { type: GraphQLString },
  }),
});

const OmimEdgesType = new GraphQLObjectType({
  name: 'OmimEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: OmimType },
  }),
});

const OmimHitsType = new GraphQLObjectType({
  name: 'OmimHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(OmimEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

export const OmimsType = new GraphQLObjectType({
  name: 'OmimsType',
  fields: () => ({
    hits: {
      type: OmimHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, OmimType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default OmimsType;
