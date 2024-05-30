import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import GenesType from '../../gene/types/gene';
import { FrequenciesType } from './frequencies';
import variantStudiesType from './variantStudies';

const ClinvarType = new GraphQLObjectType({
  name: 'ClinvarType',
  fields: () => ({
    clinvar_id: { type: GraphQLString },
    clin_sig: { type: new GraphQLList(GraphQLString) },
    conditions: { type: new GraphQLList(GraphQLString) },
    inheritance: { type: new GraphQLList(GraphQLString) },
    interpretations: { type: new GraphQLList(GraphQLString) },
  }),
});

const CmcType = new GraphQLObjectType({
  name: 'CmcType',
  fields: () => ({
    cosmic_id: { type: GraphQLString },
    mutation_url: { type: GraphQLString },
    sample_mutated: { type: GraphQLFloat },
    sample_ratio: { type: GraphQLFloat },
    sample_tested: { type: GraphQLFloat },
    shared_aa: { type: GraphQLFloat },
    tier: { type: GraphQLString },
  }),
});

export const VariantType = new GraphQLObjectType({
  name: 'Variant',
  fields: () => ({
    id: { type: GraphQLString, resolve: (parent) => parent.locus },
    hgvsg: { type: GraphQLString },
    locus: { type: GraphQLString },
    studies: { type: variantStudiesType },
    alternate: { type: GraphQLString },
    assembly_version: { type: GraphQLString },
    chromosome: { type: GraphQLString },
    dna_change: { type: GraphQLString },
    end: { type: GraphQLFloat },
    gene_external_reference: { type: new GraphQLList(GraphQLString) },
    hash: { type: GraphQLString },
    max_impact_score: { type: GraphQLFloat },
    reference: { type: GraphQLString },
    rsnumber: { type: GraphQLString },
    sources: { type: new GraphQLList(GraphQLString) },
    start: { type: GraphQLFloat },
    variant_class: { type: GraphQLString },
    variant_external_reference: { type: new GraphQLList(GraphQLString) },
    clinvar: { type: ClinvarType },
    cmc: { type: CmcType },
    external_frequencies: { type: FrequenciesType },
    internal_frequencies_wgs: { type: FrequenciesType },
    study_frequencies_wgs: { type: variantStudiesType },
  }),
  extensions: {
    nestedFields: [
      'genes',
      'studies',
      'genes.consequences',
      'genes.orphanet',
      'genes.hpo',
      'genes.omim',
      'genes.ddd',
      'genes.cosmic',
    ],
    /** esIndex to override on each project with the wanted value */
    esIndex: 'variant_centric',
  },
});

export default VariantType;
