import { Client } from '@opensearch-project/opensearch';

import getFamilyIds from './getFamilyIds';

/** Fake es client capturing the queries and returning canned responses per call */
const fakeEsClient = (responses: any[], calls: any[]) =>
  ({
    search: (params: any) => {
      calls.push(params);
      return Promise.resolve(responses[Math.min(calls.length - 1, responses.length - 1)]);
    },
  }) as unknown as Client;

const hitsResponse = (sources: any[]) => ({ body: { hits: { hits: sources.map((_source) => ({ _source })) } } });

describe('getFamilyIds', () => {
  it('should expand file ids with family files using the given id field', async () => {
    const calls = [];
    const esClient = fakeEsClient(
      [
        // first search: files info (data_type + families of the given files)
        hitsResponse([
          { stable_file_id: 'FH0000001', data_type: 'Aligned Reads', participants: [{ family_id: 'FH0000001' }] },
        ]),
        // second search: all family files matching the data_type
        hitsResponse([{ stable_file_id: 'FH0000001' }, { stable_file_id: 'FH0000002' }]),
      ],
      calls
    );

    const ids = await getFamilyIds(esClient, ['FH0000001'], 100, 'file_centric', 'stable_file_id');

    expect([...ids].sort()).toEqual(['FH0000001', 'FH0000002']);

    // both searches must be driven by the id field of the set, not a hard-coded file_id
    expect(calls[0].body.query.bool.must[0].terms).toEqual({ stable_file_id: ['FH0000001'], boost: 0 });
    expect(calls[0].body._source).toEqual(['stable_file_id', 'data_type', 'participants.family_id']);
    expect(calls[1].body._source).toEqual(['stable_file_id']);
  });

  it('should default to file_id for backward compatibility', async () => {
    const calls = [];
    const esClient = fakeEsClient(
      [
        hitsResponse([
          { file_id: 'FI0000001', data_type: 'Aligned Reads', participants: [{ family_id: 'FH0000001' }] },
        ]),
        hitsResponse([{ file_id: 'FI0000001' }, { file_id: 'FI0000002' }]),
      ],
      calls
    );

    const ids = await getFamilyIds(esClient, ['FI0000001'], 100, 'file_centric');

    expect([...ids].sort()).toEqual(['FI0000001', 'FI0000002']);
    expect(calls[0].body.query.bool.must[0].terms).toEqual({ file_id: ['FI0000001'], boost: 0 });
    expect(calls[1].body._source).toEqual(['file_id']);
  });

  it('should return the original ids when files have no family', async () => {
    const calls = [];
    const esClient = fakeEsClient(
      [hitsResponse([{ stable_file_id: 'FH0000001', data_type: 'Aligned Reads', participants: [{}] }])],
      calls
    );

    const ids = await getFamilyIds(esClient, ['FH0000001'], 100, 'file_centric', 'stable_file_id');

    expect(ids).toEqual(['FH0000001']);
    // no family found, no second search
    expect(calls.length).toEqual(1);
  });
});
