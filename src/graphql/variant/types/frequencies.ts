import { GraphQLFloat, GraphQLInt, GraphQLObjectType } from 'graphql';

export const TotalType = new GraphQLObjectType({
  name: 'TotalType',
  fields: () => ({
    ac: { type: GraphQLInt },
    pc: { type: GraphQLInt },
    hom: { type: GraphQLInt },
    pn: { type: GraphQLInt },
    an: { type: GraphQLInt },
    af: { type: GraphQLFloat },
    ap: { type: GraphQLFloat },
    pf: { type: GraphQLFloat },
  }),
});

export const FrequenciesBoundType = new GraphQLObjectType({
  name: 'FrequenciesBoundType',
  fields: () => ({
    ac: { type: GraphQLFloat },
    af: { type: GraphQLFloat },
    an: { type: GraphQLFloat },
    het: { type: GraphQLFloat },
    hom: { type: GraphQLFloat },
  }),
});

export const FrequenciesType = new GraphQLObjectType({
  name: 'FrequenciesType',
  fields: () => ({
    gnomad_exomes_2_1_1: { type: FrequenciesBoundType },
    gnomad_genomes_2_1_1: { type: FrequenciesBoundType },
    gnomad_genomes_3: { type: FrequenciesBoundType },
    thousand_genomes: { type: FrequenciesBoundType },
    topmed_bravo: { type: FrequenciesBoundType },
    total: { type: TotalType },
  }),
});

export default FrequenciesType;
