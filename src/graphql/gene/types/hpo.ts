import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

export const HpoType = new GraphQLObjectType({
  name: 'HpoType',
  fields: () => ({
    id: { type: GraphQLString },
    hpo_term_id: { type: GraphQLString },
    hpo_term_label: { type: GraphQLString },
    hpo_term_name: { type: GraphQLString },
  }),
});

const HpoEdgesType = new GraphQLObjectType({
  name: 'HpoEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: HpoType },
  }),
});

const HpoHitsType = new GraphQLObjectType({
  name: 'HpoHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(HpoEdgesType),
      resolve: async (parent, args) => parent.edges.map((node) => ({ searchAfter: args?.searchAfter || [], node })),
    },
  }),
});

export const HposType = new GraphQLObjectType({
  name: 'HposType',
  fields: () => ({
    hits: {
      type: HpoHitsType,
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

export default HposType;
