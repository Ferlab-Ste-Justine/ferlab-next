import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { edgesResolver, hitsResolver } from '#src/common/resolvers';
import { aggregationsType, AggsStateType, ColumnsStateType, hitsArgsType, MatchBoxStateType } from '#src/common/types';

import GraphQLJSON from '../../../common/types/jsonType';
import ConsequencesType from './consequence';
import CosmicsType from './cosmic';
import DddsType from './ddd';
import HposType from './hpo';
import OmimsType from './omim';
import OrphanetsType from './orphanet';

const GnomadType = new GraphQLObjectType({
  name: 'GnomadType',
  fields: () => ({
    loeuf: { type: GraphQLFloat },
    pli: { type: GraphQLFloat },
  }),
});

const SpliceaiType = new GraphQLObjectType({
  name: 'SpliceaiType',
  fields: () => ({
    ds: { type: GraphQLFloat },
    type: { type: new GraphQLList(GraphQLString) },
  }),
});

export const GeneType = new GraphQLObjectType({
  name: 'GeneType',
  fields: () => ({
    id: { type: GraphQLString },
    alias: { type: new GraphQLList(GraphQLString) },
    biotype: { type: GraphQLString },
    chromosome: { type: GraphQLString },
    ensembl_gene_id: { type: GraphQLString },
    entrez_gene_id: { type: GraphQLFloat },
    hash: { type: GraphQLString },
    hgnc: { type: GraphQLString },
    location: { type: GraphQLString },
    name: { type: GraphQLString },
    omim_gene_id: { type: GraphQLString },
    search_text: { type: GraphQLString },
    symbol: { type: GraphQLString },
    consequences: { type: ConsequencesType },
    cosmic: { type: CosmicsType },
    ddd: { type: DddsType },
    gnomad: { type: GnomadType },
    hpo: { type: HposType },
    omim: { type: OmimsType },
    orphanet: { type: OrphanetsType },
    spliceai: { type: SpliceaiType },
  }),
  extensions: {
    nestedFields: ['cosmic', 'ddd', 'hpo', 'omim', 'orphanet'],
    esIndex: 'gene_centric',
  },
});

const GeneEdgesType = new GraphQLObjectType({
  name: 'GeneEdgesType',
  fields: () => ({
    searchAfter: { type: GraphQLJSON },
    node: { type: GeneType },
  }),
});

const GeneHitsType = new GraphQLObjectType({
  name: 'GeneHitsType',
  fields: () => ({
    total: { type: GraphQLInt },
    edges: {
      type: new GraphQLList(GeneEdgesType),
      resolve: (parent) => edgesResolver(parent),
    },
  }),
});

const GenesType = new GraphQLObjectType({
  name: 'GenesType',
  fields: () => ({
    hits: {
      type: GeneHitsType,
      args: hitsArgsType,
      resolve: async (parent, args, context) => hitsResolver(parent, args, GeneType, context.esClient),
    },
    mapping: { type: GraphQLJSON },
    extended: { type: GraphQLJSON },
    aggsState: { type: AggsStateType },
    columnsState: { type: ColumnsStateType },
    matchBoxState: { type: MatchBoxStateType },
    aggregations: { type: aggregationsType },
  }),
});

export default GenesType;
