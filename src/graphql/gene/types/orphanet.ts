import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

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

const OrphanetHitsType = new GraphQLObjectType({
  name: 'OrphanetHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: 'OrphanetEdgesType',
          fields: () => ({
            searchAfter: { type: GraphQLJSON },
            node: { type: OrphanetType },
          }),
        })
      ),
      resolve: async (parent, args) => parent.edges.map((node) => ({ searchAfter: args?.searchAfter || [], node })),
    },
  }),
});

export const OrphanetsType = new GraphQLObjectType({
  name: 'OrphanetsType',
  fields: () => ({
    hits: {
      type: OrphanetHitsType,
      args: hitsArgsType,
      resolve: async (parent) => ({ total: parent?.length || 0, edges: parent || [] }),
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
