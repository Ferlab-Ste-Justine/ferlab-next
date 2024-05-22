import { GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

export const ColumnSortType = new GraphQLObjectType({
  name: 'ColumnSortType',
  fields: () => ({
    id: { type: GraphQLString },
    desc: { type: GraphQLBoolean },
  }),
});

export const ColumnType = new GraphQLObjectType({
  name: 'ColumnType',
  fields: () => ({
    show: { type: GraphQLBoolean },
    type: { type: GraphQLString },
    sortable: { type: GraphQLBoolean },
    canChangeShow: { type: GraphQLBoolean },
    query: { type: GraphQLString },
    jsonPath: { type: GraphQLString },
    id: { type: GraphQLString },
    field: { type: GraphQLString },
    accessor: { type: GraphQLString },
  }),
});

export const ColumnStateType = new GraphQLObjectType({
  name: 'ColumnStateType',
  fields: () => ({
    type: { type: GraphQLString },
    keyField: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    columns: { type: new GraphQLList(ColumnType) },
    defaultSorted: { type: new GraphQLList(ColumnSortType) },
  }),
});

export const ColumnsStateType = new GraphQLObjectType({
  name: 'ColumnsStateType',
  fields: () => ({
    timestamp: { type: GraphQLString },
    state: { type: ColumnStateType },
  }),
});

export default ColumnsStateType;
