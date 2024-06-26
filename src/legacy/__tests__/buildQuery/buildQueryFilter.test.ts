import buildQuery from 'src/legacy/buildQuery';

test('1.buildQuery filter', () => {
  const nestedFieldNames = ['files', 'files.foo'];

  const tests = [
    {
      input: {
        nestedFieldNames,
        filters: {
          content: { fields: ['files.foo', 'test'], value: '*v*' },
          op: 'filter',
        },
      },
      output: {
        bool: {
          should: [
            {
              nested: {
                path: 'files',
                query: {
                  bool: {
                    should: [
                      {
                        wildcard: {
                          'files.foo': {
                            case_insensitive: true,
                            value: '*v*',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              bool: {
                should: [
                  {
                    wildcard: {
                      test: {
                        case_insensitive: true,
                        value: '*v*',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  ];

  tests.forEach(({ input, output }) => {
    const actualOutput = buildQuery(input);

    expect(actualOutput).toEqual(output);
  });
});
