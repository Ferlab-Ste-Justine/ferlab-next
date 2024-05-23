import { Client } from '@opensearch-project/opensearch';
import { GraphQLResolveInfo } from 'graphql';

export interface IQueryContext {
  es: Client;
}

export type ResolverOutput<T> = T | Promise<T>;

export interface EsIndexLocation {
  esIndex: string;
}

export type Resolver<Output, Args = any> =
  | ((a: any, args: Args, c: IQueryContext, d: GraphQLResolveInfo & { mergeInfo }) => ResolverOutput<Output>)
  | ResolverOutput<Output>;

// export enum E_ExtendedFieldType {
//   boolean = 'boolean',
//   byte = 'integer',
//   date = 'date',
//   double = 'double',
//   float = 'float',
//   half_float = 'float',
//   id = 'id',
//   integer = 'integer',
//   keyword = 'keyword',
//   long = 'long',
//   nested = 'nested',
//   object = 'object',
//   scaled_float = 'float',
//   string = 'string',
//   text = 'text',
//   unsigned_long = 'long',
// }

export enum E_NumericTypeUnit {
  angle = 'angle',
  apparentPower = 'apparentPower',
  area = 'area',
  current = 'current',
  digital = 'digital',
  each = 'each',
  energy = 'energy',
  frequency = 'frequency',
  illuminance = 'illuminance',
  length = 'length',
  mass = 'mass',
  pace = 'pace',
  partsPer = 'partsPer',
  power = 'power',
  pressure = 'pressure',
  reactiveEnergy = 'reactiveEnergy',
  reactivePower = 'reactivePower',
  speed = 'speed',
  temperature = 'temperature',
  time = 'time',
  voltage = 'voltage',
  volume = 'volume',
  volumeFlowRate = 'volumeFlowRate',
}

export interface I_ExtendedMappingSetFieldInput {
  gqlId: string;
  // type: E_ExtendedFieldType;
  type: string;
  displayName: string;
  active: boolean;
  isArray: boolean;
  primaryKey: boolean;
  quickSearchEnabled: boolean;
  unit: E_NumericTypeUnit;
  displayValues: any;
  rangeStep: number;
  field: string;
}

const esToAggTypes = {
  boolean: 'Aggregations',
  byte: 'NumericAggregations',
  date: 'NumericAggregations',
  double: 'NumericAggregations',
  float: 'NumericAggregations',
  half_float: 'NumericAggregations',
  id: 'Aggregations',
  integer: 'NumericAggregations',
  keyword: 'Aggregations',
  long: 'NumericAggregations',
  object: 'Aggregations',
  scaled_float: 'NumericAggregations',
  string: 'Aggregations',
  text: 'Aggregations',
  unsigned_long: 'NumericAggregations',
  nested: 'Aggregations',
} as const;

export type ES_TYPES = keyof typeof esToAggTypes;

export const ConfigOptionalProperties = {
  DOWNLOADS: 'downloads',
  MATCHBOX: 'matchbox',
} as const;

export const ConfigRequiredProperties = {
  DOCUMENT_TYPE: 'documentType',
  EXTENDED: 'extended',
  FACETS: 'facets',
  INDEX: 'index',
  TABLE: 'table',
} as const;

export const DataFieldProperties = {
  ACCESSOR: 'accessor',
  CAN_CHANGE_SHOW: 'canChangeShow',
  DISPLAY_FORMAT: 'displayFormat',
  DISPLAY_NAME: 'displayName',
  DISPLAY_TYPE: 'displayType',
  DISPLAY_VALUES: 'displayValues',
  IS_ACTIVE: 'isActive',
  IS_ARRAY: 'isArray',
  JSON_PATH: 'jsonPath',
  FIELD_NAME: 'field',
  PRIMARY_KEY: 'primaryKey',
  QUERY: 'query',
  QUICKSEARCH_ENABLED: 'quickSearchEnabled',
  RANGE_STEP: 'rangeStep',
  SHOW: 'show',
  SORTABLE: 'sortable',
  TYPE: 'type',
  UNIT: 'unit',
} as const;

export const DownloadProperties = {
  ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS: 'allowCustomMaxRows',
  MAX_DOWNLOAD_ROWS: 'maxRows',
} as const;

export const FacetsProperties = {
  AGGS: 'aggregations',
} as const;

export const TableProperties = {
  COLUMNS: 'columns',
  DESCENDING: 'desc',
  DEFAULT_SORTING: 'defaultSorting',
  MAX_RESULTS_WINDOW: 'maxResultsWindow',
  ROW_ID_FIELD_NAME: 'rowIdFieldName',
} as const;

//////////////////////////////////

export const ConfigProperties = {
  ...ConfigRequiredProperties,
  ...ConfigOptionalProperties,
  ...DataFieldProperties,
  ...DownloadProperties,
  ...FacetsProperties,
  ...TableProperties,
};

export type ConfigProperties = typeof ConfigRequiredProperties | typeof ConfigOptionalProperties;

export interface AggConfigsInterface {
  [ConfigProperties.DISPLAY_NAME]: string;
  [ConfigProperties.DISPLAY_TYPE]: string;
  [ConfigProperties.FIELD_NAME]: string;
  [ConfigProperties.IS_ACTIVE]: boolean; // TODO: what is this? active = API vs show = UI? "isActive"
  [ConfigProperties.SHOW]: boolean;
  // TODO: implement these
  // max results
  // collapsible
}

export interface ColumnConfigsInterface {
  [ConfigProperties.ACCESSOR]: string;
  [ConfigProperties.CAN_CHANGE_SHOW]: boolean;
  [ConfigProperties.DISPLAY_FORMAT]: string;
  [ConfigProperties.DISPLAY_NAME]: string;
  [ConfigProperties.DISPLAY_TYPE]: string;
  [ConfigProperties.DISPLAY_VALUES]: Record<string, any>; // used for "readable" replacements e.g. true as "yes"
  [ConfigProperties.FIELD_NAME]: string;
  [ConfigProperties.IS_ARRAY]: boolean; // should it be displayed as a list of items, or leave as a single string
  [ConfigProperties.JSON_PATH]: string;
  [ConfigProperties.QUERY]: string;
  [ConfigProperties.SHOW]: boolean;
  [ConfigProperties.SORTABLE]: boolean;
}

export interface DownloadsConfigsInterface {
  [ConfigProperties.ALLOW_CUSTOM_MAX_DOWNLOAD_ROWS]?: boolean;
  [ConfigProperties.MAX_DOWNLOAD_ROWS]?: number;
}

export type DisplayType = 'all' | 'bits' | 'boolean' | 'bytes' | 'date' | 'list' | 'nested' | 'number' | 'keyword';

export interface ExtendedConfigsInterface {
  [ConfigProperties.DISPLAY_NAME]: string;
  [ConfigProperties.DISPLAY_TYPE]: string;
  [ConfigProperties.DISPLAY_VALUES]: Record<string, any>;
  [ConfigProperties.FIELD_NAME]: string;
  [ConfigProperties.IS_ACTIVE]: boolean; // TODO: what is this?
  [ConfigProperties.IS_ARRAY]: boolean;
  [ConfigProperties.PRIMARY_KEY]: boolean;
  [ConfigProperties.QUICKSEARCH_ENABLED]: boolean;
  [ConfigProperties.RANGE_STEP]: number;
  [ConfigProperties.TYPE]: DisplayType;
  [ConfigProperties.UNIT]: string;
}

export interface FacetsConfigsInterface {
  [ConfigProperties.AGGS]: AggConfigsInterface[];
}

export interface MatchBoxConfigsInterface {
  [ConfigProperties.DISPLAY_NAME]: string;
  [ConfigProperties.FIELD_NAME]: string;
}

export interface SortingConfigsInterface {
  [ConfigProperties.DESCENDING]: boolean;
  [ConfigProperties.FIELD_NAME]: string;
  [ConfigProperties.IS_ACTIVE]: boolean;
}

export interface TableConfigsInterface {
  [ConfigProperties.COLUMNS]: ColumnConfigsInterface[];
  [ConfigProperties.DEFAULT_SORTING]?: SortingConfigsInterface[];
  [ConfigProperties.MAX_RESULTS_WINDOW]?: number;
  [ConfigProperties.ROW_ID_FIELD_NAME]?: string;
}

export interface ConfigObject {
  [ConfigProperties.DOCUMENT_TYPE]: string;
  [ConfigProperties.DOWNLOADS]?: DownloadsConfigsInterface;
  [ConfigProperties.EXTENDED]: any[];
  [ConfigProperties.FACETS]: FacetsConfigsInterface;
  [ConfigProperties.INDEX]: string;
  [ConfigProperties.MATCHBOX]: any[];
  [ConfigProperties.TABLE]: TableConfigsInterface;
}

export interface FieldFromMapping {
  field: string;
  type: ES_TYPES;
}
