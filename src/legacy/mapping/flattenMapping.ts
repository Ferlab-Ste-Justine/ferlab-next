import flattenDeep from 'lodash/flattenDeep';

const joinWith =
  (s = '.') =>
  (x) =>
    x ? x + s : '';

const flattenMapping = (properties, parent = '') =>
  flattenDeep(
    Object.entries(properties).map(([field, data]) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !data.properties
        ? {
            field: joinWith()(parent) + field,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type: data.type,
          }
        : [
            {
              field: joinWith()(parent) + field,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              type: data.type || 'object',
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...flattenMapping(data.properties, joinWith()(parent) + field),
          ]
    )
  );
export default flattenMapping;
