import buildQuery from 'src/legacy/buildQuery';

test('1.buildQuery should handle empty sqon', () => {
  expect(
    buildQuery({
      filters: {
        content: [],
        op: 'and',
      },
    })
  ).toEqual({ bool: { must: [] } });
});

test('2.buildQuery "and" and "or" ops', () => {
  const tests = [
    {
      input: {
        filters: {
          content: [
            {
              content: { field: 'project_code', value: ['ACC'] },
              op: 'in',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: { must: [{ terms: { boost: 0, project_code: ['ACC'] } }] },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: { field: 'project_code', value: ['ACC'] },
              op: 'in',
            },
          ],
          op: 'or',
        },
      },
      output: {
        bool: { should: [{ terms: { boost: 0, project_code: ['ACC'] } }] },
      },
    },
    {
      input: {
        filters: {
          op: 'or',
          content: [
            {
              op: 'in',
              content: { field: 'project_code', value: ['__missing__'] },
            },
          ],
        },
      },
      output: {
        bool: {
          should: [
            {
              bool: {
                must_not: [{ exists: { boost: 0, field: 'project_code' } }],
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

test('3.buildQuery "all" ops', () => {
  const tests = [
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'diagnoses.diagnosis',
                value: ['ganglioglioma', 'low grade glioma'],
              },
              op: 'all',
            },
          ],
          op: 'and',
        },
        nestedFieldNames: ['diagnoses'],
      },
      output: {
        bool: {
          must: [
            {
              bool: {
                must: [
                  {
                    nested: {
                      path: 'diagnoses',
                      query: {
                        bool: {
                          must: [
                            {
                              terms: {
                                'diagnoses.diagnosis': ['ganglioglioma'],
                                boost: 0,
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                  {
                    nested: {
                      path: 'diagnoses',
                      query: {
                        bool: {
                          must: [
                            {
                              terms: {
                                'diagnoses.diagnosis': ['low grade glioma'],
                                boost: 0,
                              },
                            },
                          ],
                        },
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
    {
      input: {
        nestedFieldNames: ['diagnoses'],
        filters: {
          content: [
            {
              content: {
                field: 'diagnoses.diagnosis',
                value: ['ganglioglioma', 'low grade glioma'],
              },
              op: 'all',
              pivot: 'diagnoses',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              bool: {
                must: [
                  {
                    nested: {
                      path: 'diagnoses',
                      query: {
                        bool: {
                          must: [
                            {
                              terms: {
                                'diagnoses.diagnosis': ['ganglioglioma'],
                                boost: 0,
                              },
                            },
                            {
                              terms: {
                                'diagnoses.diagnosis': ['low grade glioma'],
                                boost: 0,
                              },
                            },
                          ],
                        },
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

test('4.buildQuery "and", "or" ops nested inside each other', () => {
  const tests = [
    {
      input: {
        filters: {
          content: [
            {
              content: [
                {
                  content: { field: 'project_code', value: ['ACC'] },
                  op: 'in',
                },
              ],
              op: 'or',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              bool: {
                should: [{ terms: { boost: 0, project_code: ['ACC'] } }],
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

test('5.buildQuery "=" and "!=" ops', () => {
  const tests = [
    {
      input: {
        filters: {
          content: {
            field: 'project_code',
            value: ['ACC'],
          },
          op: '=',
        },
      },
      output: { terms: { project_code: ['ACC'], boost: 0 } },
    },
    {
      input: {
        filters: {
          content: {
            field: 'project_code',
            value: 'ACC',
          },
          op: '!=',
        },
      },
      output: {
        bool: { must_not: [{ terms: { project_code: ['ACC'], boost: 0 } }] },
      },
    },
    {
      input: {
        filters: {
          op: 'and',
          content: [
            { op: '=', content: { field: 'program', value: ['TCGA'] } },
            { op: '=', content: { field: 'status', value: ['legacy'] } },
          ],
        },
      },
      output: {
        bool: {
          must: [{ terms: { program: ['TCGA'], boost: 0 } }, { terms: { status: ['legacy'], boost: 0 } }],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'program',
                value: ['TCGA'],
              },
              op: '=',
            },
            {
              content: {
                field: 'status',
                value: ['legacy'],
              },
              op: '!=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            { terms: { program: ['TCGA'], boost: 0 } },
            {
              bool: { must_not: [{ terms: { status: ['legacy'], boost: 0 } }] },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: [
                {
                  content: {
                    field: 'program',
                    value: ['TCGA'],
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'project',
                    value: ['ACC'],
                  },
                  op: '=',
                },
              ],
              op: 'and',
            },
            {
              content: {
                field: 'status',
                value: ['legacy'],
              },
              op: '=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            { terms: { program: ['TCGA'], boost: 0 } },
            { terms: { project: ['ACC'], boost: 0 } },
            { terms: { status: ['legacy'], boost: 0 } },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: [
                {
                  content: {
                    field: 'program',
                    value: ['TCGA'],
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'project',
                    value: ['ACC'],
                  },
                  op: '=',
                },
              ],
              op: 'and',
            },
            { op: '!=', content: { field: 'status', value: ['legacy'] } },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            { terms: { program: ['TCGA'], boost: 0 } },
            { terms: { project: ['ACC'], boost: 0 } },
            {
              bool: { must_not: [{ terms: { status: ['legacy'], boost: 0 } }] },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: [
                {
                  content: {
                    field: 'program',
                    value: ['TCGA'],
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'project',
                    value: ['ACC'],
                  },
                  op: '!=',
                },
              ],
              op: 'and',
            },
            {
              content: {
                field: 'status',
                value: ['legacy'],
              },
              op: '=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            { terms: { program: ['TCGA'], boost: 0 } },
            { bool: { must_not: [{ terms: { project: ['ACC'], boost: 0 } }] } },
            { terms: { status: ['legacy'], boost: 0 } },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: [
                {
                  content: {
                    field: 'program',
                    value: ['TCGA'],
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'project',
                    value: ['ACC'],
                  },
                  op: '!=',
                },
              ],
              op: 'and',
            },
            {
              content: {
                field: 'status',
                value: ['legacy'],
              },
              op: '!=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            { terms: { program: ['TCGA'], boost: 0 } },
            { bool: { must_not: [{ terms: { project: ['ACC'], boost: 0 } }] } },
            {
              bool: { must_not: [{ terms: { status: ['legacy'], boost: 0 } }] },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'program',
                value: ['TCGA'],
              },
              op: '=',
            },
            {
              content: {
                field: 'status',
                value: ['legacy'],
              },
              op: '=',
            },
          ],
          op: 'or',
        },
      },
      output: {
        bool: {
          should: [{ terms: { program: ['TCGA'], boost: 0 } }, { terms: { status: ['legacy'], boost: 0 } }],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'program',
                value: ['TCGA'],
              },
              op: '=',
            },
            { op: '!=', content: { field: 'status', value: ['legacy'] } },
          ],
          op: 'or',
        },
      },
      output: {
        bool: {
          should: [
            { terms: { program: ['TCGA'], boost: 0 } },
            {
              bool: { must_not: [{ terms: { status: ['legacy'], boost: 0 } }] },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'project',
                value: ['ACC'],
              },
              op: '=',
            },
            {
              content: [
                {
                  content: {
                    field: 'program',
                    value: ['TCGA'],
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'status',
                    value: ['legacy'],
                  },
                  op: '=',
                },
              ],
              op: 'and',
            },
          ],
          op: 'or',
        },
      },
      output: {
        bool: {
          should: [
            { terms: { project: ['ACC'], boost: 0 } },
            {
              bool: {
                must: [{ terms: { program: ['TCGA'], boost: 0 } }, { terms: { status: ['legacy'], boost: 0 } }],
              },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'access',
                value: 'protected',
              },
              op: '!=',
            },
            {
              content: [
                {
                  content: {
                    field: 'center.code',
                    value: '01',
                  },
                  op: '=',
                },
                {
                  content: {
                    field: 'cases.project.primary_site',
                    value: 'Brain',
                  },
                  op: '=',
                },
              ],
              op: 'and',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              bool: {
                must_not: [{ terms: { access: ['protected'], boost: 0 } }],
              },
            },
            { terms: { 'center.code': ['01'], boost: 0 } },
            { terms: { 'cases.project.primary_site': ['Brain'], boost: 0 } },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: {
            field: 'is_canonical',
            value: [true],
          },
          op: '=',
        },
      },
      output: { terms: { is_canonical: [true], boost: 0 } },
    },
    {
      input: {
        filters: {
          content: {
            field: 'case_count',
            value: [24601],
          },
          op: '=',
        },
      },
      output: { terms: { case_count: [24601], boost: 0 } },
    },
  ];

  tests.forEach(({ input, output }) => {
    const actualOutput = buildQuery(input);

    expect(actualOutput).toEqual(output);
  });
});

test('6.buildQuery "<=" and "=>"', () => {
  const tests = [
    {
      input: {
        filters: {
          content: {
            field: 'cases.clinical.age_at_diagnosis',
            value: ['20'],
          },
          op: '<=',
        },
      },
      output: {
        range: { 'cases.clinical.age_at_diagnosis': { lte: '20', boost: 0 } },
      },
    },
    {
      input: {
        filters: {
          op: 'and',
          content: [
            {
              op: '<=',
              content: {
                field: 'cases.clinical.age_at_diagnosis',
                value: ['20'],
              },
            },
          ],
        },
      },
      output: {
        bool: {
          must: [
            {
              range: {
                'cases.clinical.age_at_diagnosis': { lte: '20', boost: 0 },
              },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'cases.clinical.age_at_diagnosis',
                value: ['30'],
              },
              op: '<=',
            },
            {
              content: {
                field: 'cases.clinical.age_at_diagnosis',
                value: ['20'],
              },
              op: '>=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              range: {
                'cases.clinical.age_at_diagnosis': { lte: '30', boost: 0 },
              },
            },
            {
              range: {
                'cases.clinical.age_at_diagnosis': { gte: '20', boost: 0 },
              },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'cases.clinical.age_at_diagnosis',
                value: ['30'],
              },
              op: '<=',
            },
            {
              content: {
                field: 'cases.clinical.age_at_diagnosis',
                value: ['20'],
              },
              op: '>=',
            },
            {
              content: {
                field: 'cases.clinical.days_to_death',
                value: ['100'],
              },
              op: '>=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              range: {
                'cases.clinical.age_at_diagnosis': { lte: '30', boost: 0 },
              },
            },
            {
              range: {
                'cases.clinical.age_at_diagnosis': { gte: '20', boost: 0 },
              },
            },
            {
              range: {
                'cases.clinical.days_to_death': { gte: '100', boost: 0 },
              },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'cases.clinical.date_of_birth',
                value: ['2017-01-01'],
              },
              op: '>=',
            },
            {
              content: {
                field: 'cases.clinical.date_of_birth',
                value: ['2017-12-01'],
              },
              op: '<=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              range: {
                'cases.clinical.date_of_birth': {
                  gte: '2017-01-01 00:00:00.000000',
                  boost: 0,
                },
              },
            },
            {
              range: {
                'cases.clinical.date_of_birth': {
                  lte: '2017-12-01 00:00:00.000000',
                  boost: 0,
                },
              },
            },
          ],
        },
      },
    },
    {
      input: {
        filters: {
          content: [
            {
              content: {
                field: 'cases.clinical.date_of_birth',
                value: ['2017-01-01 00:00:00.000000'],
              },
              op: '>=',
            },
            {
              content: {
                field: 'cases.clinical.date_of_birth',
                value: ['2017-12-01 00:00:00.000000'],
              },
              op: '<=',
            },
          ],
          op: 'and',
        },
      },
      output: {
        bool: {
          must: [
            {
              range: {
                'cases.clinical.date_of_birth': {
                  gte: '2017-01-01 00:00:00.000000',
                  boost: 0,
                },
              },
            },
            {
              range: {
                'cases.clinical.date_of_birth': {
                  lte: '2017-12-01 00:00:00.000000',
                  boost: 0,
                },
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

test('7.buildQuery "all"', () => {
  const input = {
    filters: {
      content: [
        {
          content: {
            field: 'files.kf_id',
            value: ['GF_JBMG9T1M', 'GF_WCYF2AH4'],
          },
          op: 'all',
        },
      ],
      op: 'and',
    },
    nestedFieldNames: [
      'biospecimens',
      'diagnoses',
      'family.family_compositions',
      'family.family_compositions.family_members',
      'family.family_compositions.family_members.diagnoses',
      'files',
      'files.sequencing_experiments',
    ],
  };

  const output = {
    bool: {
      must: [
        {
          bool: {
            must: [
              {
                nested: {
                  path: 'files',
                  query: {
                    bool: {
                      must: [{ terms: { 'files.kf_id': ['GF_JBMG9T1M'], boost: 0 } }],
                    },
                  },
                },
              },
              {
                nested: {
                  path: 'files',
                  query: {
                    bool: {
                      must: [{ terms: { 'files.kf_id': ['GF_WCYF2AH4'], boost: 0 } }],
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const actualOutput = buildQuery(input);

  expect(actualOutput).toEqual(output);
});

test('8.buildQuery "between"', () => {
  const input = {
    filters: {
      content: [
        {
          content: {
            field: 'biospecimens.age_at_event_days',
            value: [200, '10000'],
          },
          op: 'between',
        },
      ],
      op: 'and',
    },
    nestedFieldNames: ['biospecimens'],
  };

  const output = {
    bool: {
      must: [
        {
          nested: {
            path: 'biospecimens',
            query: {
              bool: {
                must: [
                  {
                    range: {
                      'biospecimens.age_at_event_days': {
                        boost: 0,
                        gte: 200,
                        lte: '10000',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    },
  };

  const actualOutput = buildQuery(input);

  expect(actualOutput).toEqual(output);
});

test('9.buildQuery "not-in" op', () => {
  const input = {
    filters: {
      content: [
        {
          content: {
            field: 'kf_id',
            value: ['id_1', 'id_2', 'id_3'],
          },
          op: 'not-in',
        },
      ],
      op: 'and',
    },
  };

  const output = {
    bool: {
      must: [
        {
          bool: {
            must_not: [
              {
                terms: {
                  kf_id: ['id_1', 'id_2', 'id_3'],
                  boost: 0,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const actualOutput = buildQuery(input);

  expect(actualOutput).toEqual(output);
});

// we need a way to handle object fields before the following is valid
// TODO: is this already possible?
// test('10.buildQuery must reject invalid pivot fields', () => {
//   const testFunction = () => {
//     const input = {
//       nestedFieldNames: ['files'],
//       filters: {
//         op: 'and',
//         content: [
//           {
//             op: 'all',
//             pivot: 'asdf',
//             content: {
//               field: 'files.kf_id',
//               value: ['GF_JBMG9T1M', 'GF_WCYF2AH4'],
//             },
//           },
//         ],
//       },
//     };
//     return buildQuery(input);
//   };
//   expect(testFunction).toThrow();
// });
