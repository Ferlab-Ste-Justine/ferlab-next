import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

import { AND_OP, IN_OP, OR_OP } from '#src/legacy/constants';

const OpType = new GraphQLEnumType({
  name: 'OpType',
  description: '',
  values: {
    in: { value: IN_OP },
    or: { value: OR_OP },
    and: { value: AND_OP },
  },
});

const SqonContentType = new GraphQLInputObjectType({
  name: 'SqonContentType',
  fields: () => ({
    field: { type: GraphQLString },
    value: { type: new GraphQLList(GraphQLString) },
  }),
});

const SqonElementType = new GraphQLInputObjectType({
  name: 'SqonElement',
  fields: () => ({
    content: { type: SqonContentType },
    op: { type: OpType },
  }),
});

export const RootSqonType = new GraphQLInputObjectType({
  name: 'Sqon',
  fields: () => ({
    content: { type: new GraphQLList(SqonElementType) },
    op: { type: OpType },
  }),
});
