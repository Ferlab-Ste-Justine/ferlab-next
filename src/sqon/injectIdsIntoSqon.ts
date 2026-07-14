import { Dictionary } from 'lodash';
import dropRight from 'lodash/dropRight';
import flattenDeep from 'lodash/flattenDeep';
import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';

import { SetSqon } from '../sets/types';

export type SetInfo = {
  ids: string[];
  idField?: string;
};

export const getSetIdsFromSqon = (sqon: SetSqon, collection = []) =>
  (isArray(sqon.content)
    ? flattenDeep(
        sqon.content.reduce((acc, subSqon) => [...acc, ...getSetIdsFromSqon(subSqon, collection)], collection)
      )
    : isArray(sqon.content?.value)
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        sqon.content?.value?.filter((value) => String(value).indexOf('set_id:') === 0)
      : [...(String(sqon.content?.value).indexOf?.('set_id:') === 0 ? [sqon.content.value] : [])]
  ).map((setId) => setId.replace('set_id:', ''));

/**
 * Retarget the sqon field to the id field the set ids were collected from, keeping any nested prefix
 * (e.g. a legacy file set saved with `file_id` ids stays resolvable when the portal now filters
 * on `stable_file_id` / `files.stable_file_id`, and vice versa).
 */
const retargetFieldToSetIdField = (field: string, matchedSets: SetInfo[]): string => {
  const idFields = uniq(matchedSets.map((set) => set?.idField).filter(Boolean));
  // Ambiguous (multiple sets with different id fields) or unknown (legacy content without idField): keep field as-is
  if (idFields.length !== 1) {
    return field;
  }
  const segments = String(field).split('.');
  if (segments[segments.length - 1] === idFields[0]) {
    return field;
  }
  return [...dropRight(segments), idFields[0]].join('.');
};

export const injectIdsIntoSqon = (sqon: SetSqon, setIdsToSetInfoMap: Dictionary<SetInfo>) => ({
  ...sqon,
  content: sqon.content.map((op) => {
    if (isArray(op.content)) {
      return { ...op, content: injectIdsIntoSqon(op, setIdsToSetInfoMap).content };
    }

    const values = isArray(op.content.value) ? op.content.value : [op.content.value];
    const matchedSets = values.map((value) => setIdsToSetInfoMap[value]).filter(Boolean);
    if (!matchedSets.length) {
      return op;
    }

    return {
      ...op,
      content: {
        ...op.content,
        field: retargetFieldToSetIdField(op.content.field, matchedSets),
        value: isArray(op.content.value)
          ? flattenDeep(op.content.value.map((value) => setIdsToSetInfoMap[value]?.ids || op.content.value))
          : setIdsToSetInfoMap[op.content.value]?.ids || op.content.value,
      },
    };
  }),
});
