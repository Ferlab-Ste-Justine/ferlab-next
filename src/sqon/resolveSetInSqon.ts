import { Dictionary } from 'lodash';

import { SetSqon } from '../sets/types';
import { getUserContents } from '../usersApi';
import { getSetIdsFromSqon, injectIdsIntoSqon, SetInfo } from './injectIdsIntoSqon';

export { getSetIdsFromSqon, injectIdsIntoSqon };
export type { SetInfo };

export const resolveSetsInSqon = async (
  sqon: SetSqon,
  userId: string,
  accessToken: string,
  usersApiURL: string
): Promise<SetSqon> => {
  const setIds: string[] = getSetIdsFromSqon(sqon || ({} as SetSqon));
  if (setIds.length) {
    const userSets = await getUserContents(accessToken, usersApiURL);
    const setIdsToSetInfoMap: Dictionary<SetInfo> = {};
    for (const setId of setIds) {
      const content = userSets.find((r) => r.id === setId)?.content;
      setIdsToSetInfoMap[`set_id:${setId}`] = { ids: content?.ids || [], idField: content?.idField };
    }

    return injectIdsIntoSqon(sqon, setIdsToSetInfoMap);
  } else {
    return sqon;
  }
};

export default resolveSetsInSqon;
