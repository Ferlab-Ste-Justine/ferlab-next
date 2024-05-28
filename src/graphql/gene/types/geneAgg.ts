import { GraphQLObjectType } from 'graphql';

import AggregationsType, { NumericAggregationsType } from '#src/common/types/aggregationsType';

const GeneAggType = new GraphQLObjectType({
  name: 'VariantAggType',
  fields: {
    alias: { type: AggregationsType },
    biotype: { type: AggregationsType },
    chromosome: { type: AggregationsType },
    cosmic__tumour_types_germline: { type: AggregationsType },
    ddd__disease_name: { type: AggregationsType },
    ensembl_gene_id: { type: AggregationsType },
    entrez_gene_id: { type: NumericAggregationsType },
    gnomad__loeuf: { type: NumericAggregationsType },
    gnomad__pli: { type: NumericAggregationsType },
    hash: { type: AggregationsType },
    hgnc: { type: AggregationsType },
    hpo__hpo_term_id: { type: AggregationsType },
    hpo__hpo_term_label: { type: AggregationsType },
    hpo__hpo_term_name: { type: AggregationsType },
    location: { type: AggregationsType },
    name: { type: AggregationsType },
    omim__inheritance: { type: AggregationsType },
    omim__inheritance_code: { type: AggregationsType },
    omim__name: { type: AggregationsType },
    omim__omim_id: { type: AggregationsType },
    omim_gene_id: { type: AggregationsType },
    orphanet__disorder_id: { type: NumericAggregationsType },
    orphanet__inheritance: { type: AggregationsType },
    orphanet__panel: { type: AggregationsType },
    search_text: { type: AggregationsType },
    symbol: { type: AggregationsType },
  },
});

export default GeneAggType;
