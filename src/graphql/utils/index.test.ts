import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { getFieldsFromType } from './index';

const TestType1 = new GraphQLObjectType({
  name: 'TestType1',
  fields: {
    alias: { type: new GraphQLList(GraphQLString) },
    biotype: { type: GraphQLString },
    chromosome: { type: GraphQLString },
    ensembl_gene_id: { type: GraphQLString },
  },
  extensions: {
    nestedFields: ['consequences'],
    esIndex: 'common_gene_index',
  },
});

const esGeneIndex = 'test_es_gene_index';

const TestType2 = new GraphQLObjectType({
  name: 'TestType2',
  fields: () => ({
    ...getFieldsFromType(TestType1),
  }),
  extensions: {
    ...TestType1.extensions,
    esIndex: esGeneIndex,
  },
});

describe('getFieldsFromType', () => {
  it('should merge fields correctly from TestType1', () => {
    const fields = TestType2.getFields();

    expect(fields).toHaveProperty('alias');
    expect(fields).toHaveProperty('biotype');
    expect(fields).toHaveProperty('chromosome');
    expect(fields).toHaveProperty('ensembl_gene_id');
  });

  it('should merge extensions correctly from TestType1', () => {
    expect(TestType2.extensions).toHaveProperty('nestedFields', ['consequences']);
    expect(TestType2.extensions).toHaveProperty('esIndex', esGeneIndex);
  });

  it('should return fields with args as an object', () => {
    const TestType = new GraphQLObjectType({
      name: 'TestType',
      fields: {
        alias: { type: new GraphQLList(GraphQLString) },
        biotype: { type: GraphQLString },
        chromosome: { type: GraphQLString },
        ensembl_gene_id: { type: GraphQLString },
      },
    });

    const fields = getFieldsFromType(TestType);

    Object.keys(fields).forEach((key) => {
      expect(fields[key].args).toEqual({});
    });
  });
});
