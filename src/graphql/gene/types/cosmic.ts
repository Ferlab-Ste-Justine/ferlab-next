import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

const CosmicType = new GraphQLObjectType({
  name: 'CosmicType',
  fields: () => ({
    tumour_types_germline: { type: new GraphQLList(GraphQLString) },
  }),
});

const CosmicEdgesType = new GraphQLObjectType({
  name: 'CosmicEdgesType',
  fields: () => ({
    searchAfter: { type: new GraphQLList(GraphQLInt) },
    node: { type: CosmicType },
  }),
});

const CosmicHitsType = new GraphQLObjectType({
  name: 'CosmicHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(CosmicEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

const CosmicsType = new GraphQLObjectType({
  name: 'CosmicsType',
  fields: () => ({
    hits: {
      type: CosmicHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, CosmicType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default CosmicsType;
