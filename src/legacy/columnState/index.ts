import flattenDeep from 'lodash/flattenDeep';

import { getEsMappingProperties } from '#src/elasticsearch/utils';

import { I_Column, I_ColumnSetState } from './types';

export const toQuery = (field = '') =>
  field
    .split('.')
    .reverse()
    .reduce((acc, segment, i) => {
      if (i === 0) {
        return segment;
      } else {
        return `${segment.indexOf('edges[') === 0 ? 'edges' : segment} {
						${acc}
					}`;
      }
    }, '');

const appendDot = (str = '') => (str ? str + '.' : '');

export const esToColumnType = {
  boolean: 'boolean',
  byte: 'number',
  date: 'date',
  double: 'number',
  float: 'number',
  half_float: 'number',
  id: 'string',
  integer: 'number',
  keyword: 'string',
  long: 'number',
  object: 'string',
  scaled_float: 'number',
  string: 'string',
  text: 'string',
  unsigned_long: 'number',
};

const mappingToColumnsType = (properties = {}, parent = '', isList = false) =>
  flattenDeep(
    Object.entries(properties).map(([field, data]: any) =>
      !data.properties
        ? {
            type: isList ? 'list' : esToColumnType[data.type],
            field: `${appendDot(parent) + field}`,
          }
        : [
            mappingToColumnsType(
              data.properties,
              `${appendDot(parent)}${data.type === 'nested' ? `${appendDot(field)}hits.edges[0].node` : field}`,
              data.type === 'nested' || isList
            ),
            ...(data.type === 'nested'
              ? [
                  {
                    type: 'number',
                    field: `${appendDot(parent)}${appendDot(field)}hits.total`,
                  },
                ]
              : []),
          ]
    )
  );

const mappingToColumnsState = (mapping) =>
  mappingToColumnsType(mapping).map(({ field, type }) => {
    const id = field.replace(/hits\.edges\[\d*\].node\./g, '');

    return {
      show: false,
      type,
      sortable: type !== 'list',
      canChangeShow: type !== 'list',
      field: id,
      ...(type === 'list'
        ? {
            query: toQuery(field),
            jsonPath: `$.${field.replace(/\[\d*\]/g, '[*]')}`,
          }
        : { accessor: field }),
    };
  });

export const timestamp = () => new Date().toISOString();

export const createColumnSetState = async ({
  graphqlField = '',
  esIndex = '',
  esClient,
}): Promise<I_ColumnSetState> => {
  const esMappingProperties = await getEsMappingProperties({ esIndex, esClient });
  const columns: I_Column[] = mappingToColumnsState(esMappingProperties);
  return {
    state: {
      type: graphqlField,
      keyField: 'id',
      defaultSorted: [{ id: columns[0].id || columns[0].accessor, desc: false }],
      columns,
    },
    timestamp: timestamp(),
  };
};
