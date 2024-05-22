/*
 * taken here: https://github.com/taion/graphql-type-json/blob/10418fa03875947140d1c0bd8b8de51926252e35/src/index.js
 * In Arranger, the lib "graphql-type-json" is used for json object.
 * Since the lib is outdated and simple, needed code was copied here once and for all.
 * */

import { GraphQLScalarType } from 'graphql';
import { Kind, print } from 'graphql/language';

function identity(value) {
  return value;
}

function parseObject(typeName, ast, variables) {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(typeName, field.value, variables);
  });

  return value;
}

function parseLiteral(typeName, ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(typeName, ast, variables);
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(typeName, n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined;
    default:
      throw new TypeError(`${typeName} cannot represent value: ${print(ast)}`);
  }
}

// This named export is intended for users of CommonJS. Users of ES modules
//  should instead use the default export.
export const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description:
    // eslint-disable-next-line max-len
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  // specifiedByUrl: 'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
  serialize: identity,
  parseValue: identity,
  parseLiteral: (ast, variables) => parseLiteral('JSON', ast, variables),
});

export default GraphQLJSON;
