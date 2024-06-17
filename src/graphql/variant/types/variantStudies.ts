import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

import { TotalType } from './frequencies';

export const VariantStudyType = new GraphQLObjectType({
  name: 'VariantStudyType',
  fields: () => ({
    id: { type: GraphQLString },
    study_code: { type: GraphQLString },
    study_id: { type: GraphQLString },
    transmission: { type: new GraphQLList(GraphQLString) },
    zygosity: { type: new GraphQLList(GraphQLString) },
    total: { type: TotalType },
  }),
});

const VariantStudyEdgesType = new GraphQLObjectType({
  name: 'VariantStudyEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: VariantStudyType },
  }),
});

const VariantStudiesHitsType = new GraphQLObjectType({
  name: 'VariantStudiesHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(VariantStudyEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

const VariantStudiesType = new GraphQLObjectType({
  name: 'VariantStudiesType',
  fields: () => ({
    hits: {
      type: VariantStudiesHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, VariantStudyType, context.esClient),
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
