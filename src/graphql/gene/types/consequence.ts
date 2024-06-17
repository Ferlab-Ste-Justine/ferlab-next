import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';
import GraphQLJSON from '#src/common/types/jsonType';

const AminoAcidsType = new GraphQLObjectType({
  name: 'AminoAcidsType',
  fields: {
    reference: { type: GraphQLString },
    variant: { type: GraphQLString },
  },
});

const CodonsType = new GraphQLObjectType({
  name: 'CodonsType',
  fields: {
    reference: { type: GraphQLString },
    variant: { type: GraphQLString },
  },
});

const ConservationsType = new GraphQLObjectType({
  name: 'ConservationsType',
  fields: {
    phyloP100way_vertebrate: { type: GraphQLFloat },
    phyloP17way_primate: { type: GraphQLFloat },
  },
});

const ExonType = new GraphQLObjectType({
  name: 'ExonType',
  fields: {
    rank: { type: GraphQLString },
    total: { type: GraphQLFloat },
  },
});

const IntronType = new GraphQLObjectType({
  name: 'IntronType',
  fields: {
    rank: { type: GraphQLString },
    total: { type: GraphQLFloat },
  },
});

const PredictionsType = new GraphQLObjectType({
  name: 'PredictionsType',
  fields: {
    cadd_phred: { type: GraphQLFloat },
    cadd_score: { type: GraphQLFloat },
    dann_score: { type: GraphQLFloat },
    fathmm_pred: { type: GraphQLString },
    fathmm_score: { type: GraphQLFloat },
    lrt_pred: { type: GraphQLString },
    lrt_score: { type: GraphQLFloat },
    polyphen2_hvar_pred: { type: GraphQLString },
    polyphen2_hvar_score: { type: GraphQLFloat },
    revel_score: { type: GraphQLFloat },
    sift_pred: { type: GraphQLString },
    sift_score: { type: GraphQLFloat },
  },
});

export const ConsequenceType = new GraphQLObjectType({
  name: 'ConsequenceType',
  fields: () => ({
    id: { type: GraphQLString },
    aa_change: { type: GraphQLString },
    canonical: { type: GraphQLBoolean },
    cdna_position: { type: GraphQLString },
    cds_position: { type: GraphQLString },
    coding_dna_change: { type: GraphQLString },
    consequence: { type: new GraphQLList(GraphQLString) },
    ensembl_feature_id: { type: GraphQLString },
    ensembl_transcript_id: { type: GraphQLString },
    feature_type: { type: GraphQLString },
    hgvsc: { type: GraphQLString },
    hgvsp: { type: GraphQLString },
    impact_score: { type: GraphQLFloat },
    mane_plus: { type: GraphQLBoolean },
    mane_select: { type: GraphQLBoolean },
    picked: { type: GraphQLBoolean },
    protein_position: { type: GraphQLString },
    refseq_mrna_id: { type: new GraphQLList(GraphQLString) },
    refseq_protein_id: { type: GraphQLString },
    strand: { type: GraphQLString },
    uniprot_id: { type: GraphQLString },
    vep_impact: { type: GraphQLString },
    amino_acids: { type: AminoAcidsType },
    codons: { type: CodonsType },
    conservations: { type: ConservationsType },
    exon: { type: ExonType },
    intron: { type: IntronType },
    predictions: { type: PredictionsType },
  }),
});

const ConsequenceEdgesType = new GraphQLObjectType({
  name: 'ConsequenceEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: ConsequenceType },
  }),
});

const ConsequenceHitsType = new GraphQLObjectType({
  name: 'ConsequenceHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(ConsequenceEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

export const ConsequencesType = new GraphQLObjectType({
  name: 'ConsequencesType',
  fields: () => ({
    hits: {
      type: ConsequenceHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, ConsequenceType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default ConsequencesType;
