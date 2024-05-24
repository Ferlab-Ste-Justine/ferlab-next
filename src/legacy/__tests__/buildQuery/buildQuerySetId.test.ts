import buildQuery from 'src/legacy/buildQuery';
import { ES_ARRANGER_SET_INDEX, ES_ARRANGER_SET_TYPE } from 'src/legacy/constants';

test('1.buildQuery sets', () => {
  const nestedFieldNames = ['files', 'files.foo'];

  const tests = [
    {
      input: {
        nestedFieldNames,
        filters: {
          content: { field: 'case_id', value: ['set_id:aaa'] },
          op: 'in',
        },
      },
      output: {
        terms: {
          case_id: {
            index: ES_ARRANGER_SET_INDEX,
            type: ES_ARRANGER_SET_TYPE,
            id: 'aaa',
            path: 'ids',
          },
          boost: 0,
        },
      },
    },
    {
      input: {
        nestedFieldNames,
        filters: {
          content: { field: 'ssms.ssm_id', value: ['set_id:aaa'] },
          op: 'in',
        },
      },
      output: {
        terms: {
          'ssms.ssm_id': {
            index: ES_ARRANGER_SET_INDEX,
            type: ES_ARRANGER_SET_TYPE,
            id: 'aaa',
            path: 'ids',
          },
          boost: 0,
        },
      },
    },
    {
      input: {
        nestedFieldNames,
        filters: {
          content: { field: 'files.file_id', value: ['set_id:aaa'] },
          op: 'in',
        },
      },
      output: {
        nested: {
          path: 'files',
          query: {
            bool: {
              must: [
                {
                  terms: {
                    'files.file_id': {
                      index: ES_ARRANGER_SET_INDEX,
                      type: ES_ARRANGER_SET_TYPE,
                      id: 'aaa',
                      path: 'ids',
                    },
                    boost: 0,
                  },
                },
              ],
            },
          },
        },
      },
    },
  ];

  tests.forEach(({ input, output }) => {
    const actualOutput = buildQuery(input);

    expect(actualOutput).toEqual(output);
  });
});
