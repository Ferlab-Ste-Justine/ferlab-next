import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { aggregationsType, AggsStateType, ColumnsStateType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

import { TotalType } from './frequencies';

/** way of have hits.edges.node all combined in one const type */
const VariantStudiesType = new GraphQLObjectType({
  name: 'VariantStudiesType',
  fields: () => ({
    hits: {
      type: new GraphQLObjectType({
        name: 'VariantStudyHitsType',
        fields: () => ({
          total: { type: GraphQLInt },
          edges: {
            type: new GraphQLList(
              new GraphQLObjectType({
                name: 'VariantStudyEdgesType',
                fields: () => ({
                  searchAfter: { type: new GraphQLList(GraphQLInt) },
                  node: {
                    type: new GraphQLObjectType({
                      name: 'VariantStudyType',
                      fields: () => ({
                        id: { type: GraphQLString },
                        study_code: { type: GraphQLString },
                        study_id: { type: GraphQLString },
                        transmission: { type: new GraphQLList(GraphQLString) },
                        zygosity: { type: new GraphQLList(GraphQLString) },
                        total: { type: TotalType },
                      }),
                    }),
                  },
                }),
              })
            ),
            resolve: async (parent, args) =>
              parent.edges.map((node) => ({
                searchAfter: args?.searchAfter || [],
                node,
              })),
          },
        }),
      }),
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

export default VariantStudiesType;
