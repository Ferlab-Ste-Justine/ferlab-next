import { GraphQLObjectType } from 'graphql';

/**
 * After trying to merge two GraphQLObjectType
 * We have this error: `Error: Variant.id args must be an object with argument names as keys.`
 * The `args` appear to be an empty array instead of an object.
 * This function fix the `args` and return the all the fields
 *
 * @param {GraphQLObjectType} graphqlObjectType
 * @returns {{}}
 */
export const getFieldsFromType = (graphqlObjectType: GraphQLObjectType) => {
  const fields = graphqlObjectType.getFields();
  const fieldMap = {};
  Object.keys(fields).forEach((key) => {
    fieldMap[key] = {
      ...fields[key],
      args: Array.isArray(fields[key].args) ? {} : fields[key].args, // Ensure args is an object and not array
    };
  });
  return fieldMap;
};
