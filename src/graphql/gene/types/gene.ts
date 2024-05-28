import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

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
    id: { type: GraphQLString, resolve: (parent) => parent.alias },
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
    nestedFields: ['consequences'],
    esIndex: 'gene_centric',
  },
});

export default GeneType;
