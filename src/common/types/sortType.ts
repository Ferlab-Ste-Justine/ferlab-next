import { GraphQLEnumType, GraphQLInputObjectType, GraphQLString } from 'graphql';

const OrderType = new GraphQLEnumType({
  name: 'Order',
  description: '',
  values: {
    desc: { value: 'desc' },
    asc: { value: 'asc' },
  },
});

export const SortType = new GraphQLInputObjectType({
  name: 'Sort',
  fields: {
    field: { type: GraphQLString },
    order: { type: OrderType },
  },
});
