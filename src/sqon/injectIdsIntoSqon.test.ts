import { SetSqon } from '../sets/types';
import { injectIdsIntoSqon, SetInfo } from './injectIdsIntoSqon';

describe('injectIdsIntoSqon', () => {
  const legacyFileSet: SetInfo = { ids: ['FI0000001', 'FI0000002'], idField: 'file_id' };
  const newFileSet: SetInfo = { ids: ['FH0000001', 'FH0000002'], idField: 'stable_file_id' };

  it('should inject ids of a new file set without changing the field', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': newFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['FH0000001', 'FH0000002'] } }],
    });
  });

  it('should retarget the field to the idField of a legacy file set (backward compatibility)', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': legacyFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'file_id', value: ['FI0000001', 'FI0000002'] } }],
    });
  });

  it('should keep the nested prefix when retargeting the field', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'files.stable_file_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': legacyFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'files.file_id', value: ['FI0000001', 'FI0000002'] } }],
    });
  });

  it('should retarget a legacy field to the idField of a new file set', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'file_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': newFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['FH0000001', 'FH0000002'] } }],
    });
  });

  it('should not change the field when the set has no idField', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': { ids: ['FI0000001'] } });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['FI0000001'] } }],
    });
  });

  it('should not change the field when referenced sets have different idFields', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc', 'set_id:def'] } }],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': legacyFileSet, 'set_id:def': newFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [
        {
          op: 'in',
          content: {
            field: 'stable_file_id',
            value: ['FI0000001', 'FI0000002', 'FH0000001', 'FH0000002'],
          },
        },
      ],
    });
  });

  it('should leave contents without set references untouched', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [
        { op: 'in', content: { field: 'study_code', value: ['study1'] } },
        { op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc'] } },
      ],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': newFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [
        { op: 'in', content: { field: 'study_code', value: ['study1'] } },
        { op: 'in', content: { field: 'stable_file_id', value: ['FH0000001', 'FH0000002'] } },
      ],
    });
  });

  it('should resolve sets in nested boolean operations', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [
        {
          op: 'or',
          content: [{ op: 'in', content: { field: 'stable_file_id', value: ['set_id:abc'] } }],
        },
      ],
    };

    const result = injectIdsIntoSqon(sqon, { 'set_id:abc': legacyFileSet });

    expect(result).toEqual({
      op: 'and',
      content: [
        {
          op: 'or',
          content: [{ op: 'in', content: { field: 'file_id', value: ['FI0000001', 'FI0000002'] } }],
        },
      ],
    });
  });

  it('should not retarget the field of a participant set queried by participant_id', () => {
    const sqon: SetSqon = {
      op: 'and',
      content: [{ op: 'in', content: { field: 'participants.participant_id', value: ['set_id:abc'] } }],
    };

    const result = injectIdsIntoSqon(sqon, {
      'set_id:abc': { ids: ['PT0000001'], idField: 'participant_id' },
    });

    expect(result).toEqual({
      op: 'and',
      content: [{ op: 'in', content: { field: 'participants.participant_id', value: ['PT0000001'] } }],
    });
  });
});
