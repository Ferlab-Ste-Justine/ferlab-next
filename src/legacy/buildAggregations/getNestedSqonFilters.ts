import normalizeFilters from '../buildQuery/normalizeFilters';
import { AND_OP, NOT_OP, OR_OP } from '../constants';

const getNestedSqonFilters = ({ sqon = null, nestedFieldNames = [], accumulator = {}, parentPivot = '.' }) => {
  const { op } = sqon;
  if ([AND_OP, OR_OP, NOT_OP].includes(op)) {
    const { content = [], pivot } = sqon;
    content.forEach((c) =>
      getNestedSqonFilters({
        sqon: c,
        nestedFieldNames,
        accumulator,
        parentPivot: pivot,
      })
    );
  } else {
    const {
      content: { field: sqonFieldName, fields: sqonFieldNames },
    } = sqon;
    const fieldNames = sqonFieldNames || [sqonFieldName];
    fieldNames.forEach((field) => {
      const splitFieldName = field?.split('.') || [''];
      const parentPath = Array.isArray(splitFieldName) && splitFieldName.slice(0, splitFieldName.length - 1)?.join('.');
      const isNested = parentPath && nestedFieldNames?.includes(parentPath);

      if (splitFieldName.length > 1 && isNested && parentPivot !== parentPath) {
        accumulator[parentPath] = [...(accumulator[parentPath] || []), sqon];
      }
    });
  }
  return accumulator;
};

export default ({ sqon = null, nestedFieldNames }) => {
  const normalized = normalizeFilters(sqon);

  return sqon
    ? getNestedSqonFilters({
        sqon: normalized,
        nestedFieldNames,
      })
    : {};
};
