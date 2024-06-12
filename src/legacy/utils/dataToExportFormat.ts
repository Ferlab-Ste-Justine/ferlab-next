import { format, isValid, parseISO } from 'date-fns';
import jsonPath from 'jsonpath';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import through2 from 'through2';

import { getEsMapping } from '#src/elasticsearch/utils';

import { getExtendedFields } from '../mapping/extendMapping';

const STANDARD_DATE = 'yyyy-MM-dd';

const dateHandler = (value, { dateFormat = STANDARD_DATE }) => {
  switch (true) {
    case isNil(value):
      return '';

    case isValid(new Date(value)):
      return format(new Date(value), dateFormat);

    case isValid(parseISO(value)):
      return format(parseISO(value), dateFormat);

    case !isNaN(parseInt(value, 10)):
      return format(parseInt(value, 10), dateFormat);

    default: {
      console.error('unhandled "date"', value, dateFormat);
      return value;
    }
  }
};

const getAllValue = (data) => {
  if (typeof data === 'object') {
    return Object.values(data || {})
      .map(getAllValue)
      .reduce((a, b) => a.concat(b), []);
  } else {
    return data;
  }
};

const getValue = (row, column) => {
  const valueFromExtended = (value) => {
    switch (true) {
      case column?.extendedDisplayValues?.constructor === Object &&
        Object.keys(column.extendedDisplayValues).length > 0:
        return column.extendedDisplayValues[value];

      case column.isArray && Array.isArray(value):
        return value
          .map((each) => valueFromExtended(each))
          .join(';')
          .replace(';;', ';');

      case [column.displayType, column.type].includes('date'):
        return dateHandler(value, { dateFormat: column.displayFormat });

      default:
        return value;
    }
  };

  if (column.jsonPath) {
    return jsonPath
      .query(row, column.jsonPath.split('.hits.edges[*].node.').join('[*].'))
      .map(getAllValue)
      .reduce((a, b) => a.concat(b), [])
      .map(valueFromExtended)
      .join(', ');
  } else if (column.accessor) {
    return valueFromExtended(get(row, column.accessor));
  } else {
    return '';
  }
};

const getRows = (args) => {
  const { row, data = row, paths, pathIndex = 0, columns, entities = [] } = args;
  if (pathIndex >= paths.length - 1) {
    return [
      columns.map((column) => {
        const entity = entities
          .slice()
          .reverse()
          .find((entity) => column.field.indexOf(entity.field) === 0);

        if (entity) {
          return getValue(entity.data, {
            ...column,
            jsonPath: column.field.replace(`${entity.path.join('.')}.`, ''),
          });
        } else {
          return getValue(row, column);
        }
      }),
    ];
  } else {
    const currentPath = paths[pathIndex];
    return flatten(
      (get(data, currentPath) || []).map((node) =>
        getRows({
          ...args,
          data: node,
          pathIndex: pathIndex + 1,
          entities: [
            ...entities,
            {
              path: paths.slice(0, pathIndex + 1),
              field: paths.slice(0, pathIndex + 1).join(''),
              // TODO: don't assume hits.edges.node.
              // .replace(/(\.hits.edges(node)?)/g, ''),
              data: node,
            },
          ],
        })
      )
    );
  }
};

export const columnsToHeader = ({ columns, extendedFieldsDict, fileType = 'tsv' }) => {
  const columnHeaders = columns.reduce((output, { accessor, displayName, field, Header }) => {
    const fieldDefaultExtendedDetails = extendedFieldsDict[field || accessor];

    return {
      ...output,
      [field || accessor]: displayName || Header || fieldDefaultExtendedDetails?.displayName || field,
    };
  }, {});

  switch (fileType) {
    case 'json': {
      return columnHeaders;
    }

    case 'tsv': {
      return Object.values(columnHeaders).join('\t');
    }

    default:
      return '';
  }
};

const pushToStream = (line, stream) => {
  stream.push(`${line}\n`);
};

export const dataToTSV = ({ columns, extendedFieldsDict, isFirst, pipe, data: { hits }, uniqueBy, valueWhenEmpty }) => {
  if (isFirst) {
    const headerRow = columnsToHeader({
      columns,
      extendedFieldsDict,
      fileType: 'tsv',
    });
    pushToStream(headerRow, pipe);
  }

  transformData({
    pipe,
    columns,
    hits,
    uniqueBy,
    valueWhenEmpty,
    dataTransformer: transformDataToTSV,
  });
};

/**
 * This should ideally stream data as a JSON list using JSONStream
 * but as of now; in favor of simplicity; it streams each row as separate JSON object
 * and it is left up to consuming application to make a well formatted
 * JSON list from individual JSON objects
 * See https://github.com/nci-hcmi-catalog/portal/tree/master/api/src/dataExport.js for an example consumer
 * @param {*} param0
 */
export const dataToJSON = ({
  isFirst,
  pipe,
  columns,
  data: { hits },
  uniqueBy,
  valueWhenEmpty,
  extendedFieldsDict,
}) => {
  if (isFirst) {
    const headerRow = columnsToHeader({
      columns,
      extendedFieldsDict,
      fileType: 'json',
    });
    pushToStream(JSON.stringify(headerRow), pipe);
  }

  transformData({
    pipe,
    columns,
    hits,
    uniqueBy,
    valueWhenEmpty,
    dataTransformer: transformDataToJSON,
  });
};

const transformData = ({ hits, uniqueBy, columns, valueWhenEmpty, pipe, dataTransformer }) => {
  hits
    .map((row) => dataTransformer({ row, uniqueBy, columns, valueWhenEmpty }))
    .forEach((transformedRow) => {
      pushToStream(transformedRow, pipe);
    });
};

const rowToTSV = ({ row, valueWhenEmpty }) => row.map((r) => r || valueWhenEmpty).join('\t');

const transformDataToTSV = ({ row, uniqueBy, columns, valueWhenEmpty }) =>
  getRows({
    columns,
    valueWhenEmpty,
    paths: (uniqueBy || '').split('.hits.edges[].node.').filter(Boolean),
    row,
  }).map((r) => rowToTSV({ row: r, valueWhenEmpty }));

/*
example args:
{ row:                                                                                                                                         [250/1767]
   { name: 'HCM-dddd-0000-C00',                                                                                                                               
     type: '2-D: Conditionally reprogrammed cells',                                                                                                           
     growth_rate: 5,                                                                                                                                          
     files: [],
     clinical_diagnosis: { clinical_tumor_diagnosis: 'Colorectal cancer' },
     variants: [ [Object], [Object], [Object] ]
    },
  paths: [],
  columns:
   [ { field: 'name',
       accessor: 'name',
       show: true,
       type: 'entity',
       sortable: true,
       canChangeShow: true,
       query: null,
       jsonPath: null,
       Header: 'Name',
       extendedType: 'keyword',
       extendedDisplayValues: {},
       hasCustomType: true,
       minWidth: 140 },
       { field: 'split_ratio',
       accessor: 'split_ratio',
       show: true,
       type: 'string',
       sortable: true,
       canChangeShow: true,
       query: null,
       jsonPath: null,
       Header: 'Split Ratio',
       extendedType: 'keyword',
       extendedDisplayValues: {},
       hasCustomType: false } ],
  valueWhenEmpty: '--' }
*/
const rowToJSON = (args) => {
  const { row, columns, valueWhenEmpty } = args;
  return (columns || [])
    .filter((col) => col.show)
    .reduce((output, col) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      output[[col.accessor]] = row[col.accessor] || valueWhenEmpty;
      return output;
    }, {});
};

const transformDataToJSON = ({ row, uniqueBy, columns, valueWhenEmpty }) =>
  JSON.stringify(
    rowToJSON({
      columns,
      valueWhenEmpty,
      paths: (uniqueBy || '').split('.hits.edges[].node.').filter(Boolean),
      row,
    })
  );

const dataToStream = ({ fileType = 'tsv', ...args }) => {
  // transform and stream data
  if (fileType === 'tsv') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dataToTSV(args);
  } else if (fileType === 'json') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dataToJSON(args);
  } else {
    throw new Error('Unsupported file type specified for export.');
  }
};

const dataToExportFormat = async ({ columns, context, fileType = 'tsv', index, uniqueBy, valueWhenEmpty = '--' }) => {
  let isFirst = true;
  let chunkCounts = 0;
  const extendedFields = await getExtendedFields(context, index);

  const extendedFieldsDict =
    extendedFields?.reduce?.(
      (acc, { field, ...extendedField }) => ({
        ...acc,
        [field]: extendedField,
      }),
      {}
    ) || {};

  return through2.obj(function ({ hits, total }, enc, callback) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const outputStream = this;
    const args = {
      columns,
      data: { hits, total },
      extendedFieldsDict,
      fileType,
      index,
      isFirst,
      pipe: outputStream,
      uniqueBy,
      valueWhenEmpty,
    };

    dataToStream(args);

    if (isFirst) {
      isFirst = false;
    }

    callback();
    console.timeEnd(`esHitsToTsv_${chunkCounts}`);
    chunkCounts++;
  });
};

export default dataToExportFormat;
