import { SetSqon } from '../sets/types';

export const addSqonToSetSqon = (receivingSqon: SetSqon, participantSqon: SetSqon): SetSqon =>
  ({
    op: 'or',
    content: [receivingSqon, participantSqon],
  }) as SetSqon;

export const removeSqonToSetSqon = (setSqon: SetSqon, sqonToRemove: SetSqon): SetSqon => {
  const negatedSqonToRemove = {
    op: 'not',
    content: [sqonToRemove],
  };
  return {
    op: 'and',
    content: [setSqon, negatedSqonToRemove],
  } as SetSqon;
};
