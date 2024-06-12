import startCase from 'lodash/startCase';

import { getEsMappingProperties } from '../../elasticsearch/utils';
import {
  ColumnConfigsInterface,
  ConfigProperties,
  ExtendedConfigsInterface,
  FacetsConfigsInterface,
  FieldFromMapping,
  I_ExtendedMappingSetFieldInput,
  TableConfigsInterface,
} from '../types';
import flattenMapping from './flattenMapping';

export const getExtendedFields = async (context: any, index: string) => {
  try {
    const { getExtendedMappingByIndex, getESIndexByIndex, esClient } = context;
    const extendedMapping = getExtendedMappingByIndex(index);
    const esIndex = getESIndexByIndex(index);
    const esMappingProperties = await getEsMappingProperties({ esClient, esIndex });
    const fieldsFromMapping = await flattenMappingToFields(esMappingProperties);
    return extendFields(fieldsFromMapping, extendedMapping);
  } catch (err) {
    console.log(
      'Something happened while extending the ES mappings.\n' + '  Defaulting to "extended" config from files.\n'
    );
    console.error('[extendedFields]', err);
    return [];
  }
};

const toQuery = (field = '') =>
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

export const extendColumns = (
  tableConfig: TableConfigsInterface,
  extendedFields: ExtendedConfigsInterface[]
): TableConfigsInterface => {
  const columnsFromConfig = tableConfig?.[ConfigProperties.COLUMNS];
  const hasColumnsConfig = columnsFromConfig?.length > 0;

  hasColumnsConfig || console.log('  - No Columns config present. Defaulting to first 5 extended fields.');

  // TODO: D.R.Y. this thing

  const columns = (
    hasColumnsConfig
      ? columnsFromConfig
          .map((column) => {
            const extendedObj = extendedFields?.find((obj) => obj.field === column?.field);

            return column.field
              ? {
                  ...column,
                  // This field is how React-Table finds the data
                  [ConfigProperties.ACCESSOR]: column[ConfigProperties.ACCESSOR] ?? column[ConfigProperties.FIELD_NAME],
                  // is this column selectable in the table Columns dropdown
                  [ConfigProperties.CAN_CHANGE_SHOW]: column[ConfigProperties.CAN_CHANGE_SHOW],
                  // to be used as the column's "Header"
                  [ConfigProperties.DISPLAY_NAME]:
                    column[ConfigProperties.DISPLAY_NAME] ??
                    extendedObj?.[ConfigProperties.DISPLAY_NAME] ??
                    '* ' + column[ConfigProperties.FIELD_NAME],
                  // used to format the values in the cell differently from their type set in the mapping
                  [ConfigProperties.DISPLAY_TYPE]:
                    column[ConfigProperties.DISPLAY_TYPE] ?? extendedObj?.[ConfigProperties.DISPLAY_TYPE],
                  // these likely are human readable values e.g. false means "no", true means "yes", etc.
                  [ConfigProperties.DISPLAY_VALUES]:
                    column[ConfigProperties.DISPLAY_VALUES] ?? extendedObj?.[ConfigProperties.DISPLAY_VALUES] ?? {},
                  // should the cell be understood as a list of items, or a mere string
                  [ConfigProperties.IS_ARRAY]: extendedObj?.[ConfigProperties.IS_ARRAY] || false,
                  ////////// TODO!!!!!!!!!!
                  [ConfigProperties.JSON_PATH]:
                    column[ConfigProperties.JSON_PATH] ??
                    `$.${column[ConfigProperties.FIELD_NAME].replace(/\[\d*\]/g, '[*]')}`,
                  ////////// TODO!!!!!!!!!!
                  [ConfigProperties.QUERY]:
                    column[ConfigProperties.QUERY] ?? toQuery(column[ConfigProperties.FIELD_NAME]),
                  // should the column be shown by default
                  [ConfigProperties.SHOW]: column[ConfigProperties.SHOW],
                  // self-descriptive, hopefully
                  [ConfigProperties.SORTABLE]: column[ConfigProperties.SORTABLE],
                }
              : null;
          })
          .filter(Boolean)
      : // Provides baseline configs in case none are given from file/props
        extendedFields
          ?.map((column) =>
            ['nested', 'object'].includes(column[ConfigProperties.DISPLAY_TYPE])
              ? null
              : {
                  [ConfigProperties.FIELD_NAME]: column[ConfigProperties.FIELD_NAME],
                  // This field is how React-Table finds the data
                  [ConfigProperties.ACCESSOR]: column[ConfigProperties.FIELD_NAME],
                  [ConfigProperties.CAN_CHANGE_SHOW]: true,
                  // to be used as the column's "Header"
                  [ConfigProperties.DISPLAY_NAME]:
                    column[ConfigProperties.DISPLAY_NAME] ?? '* ' + column[ConfigProperties.FIELD_NAME],
                  // used to format the values in the cell differently from their type set in the mapping
                  [ConfigProperties.DISPLAY_TYPE]: column[ConfigProperties.DISPLAY_TYPE],
                  // these likely are human readable values e.g. false means "no", true means "yes", etc.
                  [ConfigProperties.DISPLAY_VALUES]: column[ConfigProperties.DISPLAY_VALUES] ?? {},
                  // should the cell be understood as a list of items, or a mere string
                  [ConfigProperties.IS_ARRAY]: column[ConfigProperties.IS_ARRAY],
                  ////////// TODO!!!!!!!!!!
                  [ConfigProperties.JSON_PATH]: `$.${column[ConfigProperties.FIELD_NAME].replace(/\[\d*\]/g, '[*]')}`,
                  ////////// TODO!!!!!!!!!!
                  [ConfigProperties.QUERY]: toQuery(column[ConfigProperties.FIELD_NAME]),
                  // should the column be shown by default
                  [ConfigProperties.SHOW]: true,
                  // self-descriptive, hopefully
                  [ConfigProperties.SORTABLE]: false,
                }
          )
          .filter(Boolean)
          .slice(0, 10)
  ) as ColumnConfigsInterface[]; // TODO: make this better

  return {
    ...tableConfig,
    [ConfigProperties.COLUMNS]: columns,
  };
};

export const extendFacets = (facetsConfig: FacetsConfigsInterface, extendedFields: ExtendedConfigsInterface[]) => {
  const aggsFromConfig = facetsConfig?.[ConfigProperties.AGGS];
  const hasAggsConfig = aggsFromConfig?.length > 0;

  hasAggsConfig || console.log('  - No Aggregations config present. Defaulting to first 5 extended fields.');

  // TODO: D.R.Y. this thing

  const aggs = hasAggsConfig
    ? aggsFromConfig
        .map((agg) => {
          const extendedObj = extendedFields?.find((obj) => obj.field === agg.field.replace(/__/g, '.'));

          return agg.field
            ? {
                ...agg,
                [ConfigProperties.DISPLAY_NAME]:
                  agg[ConfigProperties.DISPLAY_NAME] ?? extendedObj?.[ConfigProperties.DISPLAY_NAME],
                // defines aggregation type (component used in facets)
                [ConfigProperties.DISPLAY_TYPE]:
                  agg[ConfigProperties.DISPLAY_TYPE] ?? extendedObj?.[ConfigProperties.DISPLAY_TYPE],
                // TODO: determine what "isActive" does, vs "show"
                [ConfigProperties.IS_ACTIVE]: agg[ConfigProperties.IS_ACTIVE] || false,
                // should it be shown in the facets panel
                [ConfigProperties.SHOW]: agg[ConfigProperties.SHOW] || false,
              }
            : null;
        })
        .filter(Boolean)
    : extendedFields
        ?.map((agg) =>
          agg[ConfigProperties.FIELD_NAME].includes('_id') ||
          ['nested', 'object'].includes(agg[ConfigProperties.DISPLAY_TYPE])
            ? null
            : {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                [ConfigProperties.FIELD_NAME]: agg[ConfigProperties.FIELD_NAME].replaceAll('.', '__'),
                // defines aggregation type (component used in facets)
                [ConfigProperties.DISPLAY_TYPE]: agg[ConfigProperties.DISPLAY_TYPE],
                // TODO: determine what "isActive" does, vs "show"
                [ConfigProperties.IS_ACTIVE]: true,
                // should it be shown in the facets panel
                [ConfigProperties.SHOW]: true,
              }
        )
        .filter(Boolean)
        .slice(0, 10);

  return {
    ...facetsConfig,
    [ConfigProperties.AGGS]: aggs,
  };
};

export const extendFields = (mappingFields: FieldFromMapping[], extendedFromFile: I_ExtendedMappingSetFieldInput[]) =>
  mappingFields.map(({ field, type, ...rest }) => {
    const {
      displayName = startCase(field.replace(/\./g, ' ')),
      // displayType = type,
      displayValues = {},
      // isActive = false, // TODO: what does "active" do in general?
      active = false,
      isArray = false,
      primaryKey = false,
      quickSearchEnabled = false,
      rangeStep = type === 'float' || type === 'double' ? 0.01 : 1,
      unit = null,
    } = extendedFromFile.find((customData) => customData.field === field) || {};

    return {
      displayName,
      // displayType,
      displayValues,
      field,
      active,
      isArray,
      primaryKey,
      quickSearchEnabled,
      rangeStep,
      type,
      unit,
      ...rest,
    };
  });

export const flattenMappingToFields = async (mapping: Record<string, unknown> = {}): Promise<FieldFromMapping[]> =>
  flattenMapping(mapping).map(({ field = '', type = 'keyword', ...rest }) => ({
    field,
    type,
    ...rest,
  }));

// TODO: disabled because its purpose is unclear
// export default (mapping) => extendFields(flattenMapping(mapping));

export default extendFields;
