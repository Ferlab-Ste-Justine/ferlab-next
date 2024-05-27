import { GraphQLFloat, GraphQLInt, GraphQLObjectType } from 'graphql';

export const totalType = new GraphQLObjectType({
  name: 'totalType',
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

export const frequenciesBoundType = new GraphQLObjectType({
  name: 'frequenciesBoundType',
  fields: () => ({
    ac: { type: GraphQLFloat },
    af: { type: GraphQLFloat },
    an: { type: GraphQLFloat },
    het: { type: GraphQLFloat },
    hom: { type: GraphQLFloat },
  }),
});

export const frequenciesType = new GraphQLObjectType({
  name: 'frequenciesType',
  fields: () => ({
    gnomad_exomes_2_1_1: { type: frequenciesBoundType },
    gnomad_genomes_2_1_1: { type: frequenciesBoundType },
    gnomad_genomes_3: { type: frequenciesBoundType },
    thousand_genomes: { type: frequenciesBoundType },
    topmed_bravo: { type: frequenciesBoundType },
    total: { type: totalType },
  }),
});

export default frequenciesType;
