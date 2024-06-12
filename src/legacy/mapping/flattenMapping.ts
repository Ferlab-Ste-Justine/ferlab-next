import flattenDeep from 'lodash/flattenDeep';

const joinWith =
  (s = '.') =>
  (x) =>
    x ? x + s : '';

const flattenMapping = (properties, parent = '') =>
  flattenDeep(
    Object.entries(properties).map(([field, data]: any) =>
      !data.properties
        ? {
            field: joinWith()(parent) + field,
            type: data.type,
          }
        : [
            {
              field: joinWith()(parent) + field,
              type: data.type || 'object',
            },
            ...flattenMapping(data.properties, joinWith()(parent) + field),
          ]
    )
  );
export default flattenMapping;
