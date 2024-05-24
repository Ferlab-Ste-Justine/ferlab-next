import normalizeFilters from 'src/legacy/buildQuery/normalizeFilters';
import { AND_OP, IN_OP } from 'src/legacy/constants';

test(`1.normalizeFilters must handle falsy sqon`, () => {
  const input = null;
  const output = null;

  expect(normalizeFilters(input)).toEqual(output);
});

test(`2.normalizeFilters must preserve pivots`, () => {
  const input = {
    content: [
      {
        content: {
          field: 'nested.some_field',
          value: ['val1'],
        },
        op: IN_OP,
        pivot: 'nested',
      },
    ],
    op: AND_OP,
  };

  const output = {
    content: [
      {
        content: {
          field: 'nested.some_field',
          value: ['val1'],
        },
        op: IN_OP,
        pivot: 'nested',
      },
    ],
    op: AND_OP,
    pivot: null,
  };

  expect(normalizeFilters(input)).toEqual(output);
});
