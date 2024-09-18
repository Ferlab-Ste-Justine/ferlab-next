import difference from 'lodash/difference';
import dropRight from 'lodash/dropRight';
import union from 'lodash/union';

import { addSqonToSetSqon, removeSqonToSetSqon } from '../sqon/manipulateSqon';
import { resolveSetsInSqon } from '../sqon/resolveSetInSqon';
import { searchSqon } from '../sqon/searchSqon';
import { CreateUpdateBody, Output } from '../usersApi';
import { deleteUserContent, getUserContents, postUserContent, putUserContent } from '../usersApi';
import getFamilyIds from './getFamilyIds';
import { SetNotFoundError } from './setError';
import { CreateSetBody, Set, UpdateSetContentBody, UpdateSetTagBody } from './types';

export const SubActionTypes = {
  RENAME_TAG: 'RENAME_TAG',
  ADD_IDS: 'ADD_IDS',
  REMOVE_IDS: 'REMOVE_IDS',
};

export const getUserSet = async (
  accessToken: string,
  userId: string,
  setId: string,
  usersApiURL: string
): Promise<Output> => {
  const existingSetsFilterById = (await getUserContents(accessToken, usersApiURL)).filter((r) => r.id === setId);

  if (existingSetsFilterById.length !== 1) {
    throw new SetNotFoundError('Set to update can not be found !');
  }

  return existingSetsFilterById[0];
};

export const getSets = async (accessToken: string, usersApiURL: string): Promise<Set[]> => {
  const userContents = await getUserContents(accessToken, usersApiURL);
  console.log('getSets userContents', userContents);
  return userContents.map((set) => mapResultToSet(set));
};

export const createSet = async (
  requestBody: CreateSetBody,
  accessToken: string,
  userId: string,
  usersApiURL,
  esClient,
  schema,
  maxSetContentSize: number,
  esFileIndex: string
): Promise<Set> => {
  const { sqon, sort, type, idField, tag, sharedpublicly, is_phantom_manifest, withFamily } = requestBody;
  const sqonAfterReplace = await resolveSetsInSqon(sqon, userId, accessToken, usersApiURL);
  const ids = await searchSqon(sqonAfterReplace, type, sort, idField, esClient, schema, maxSetContentSize);
  const idsWithFamily = withFamily ? await getFamilyIds(esClient, ids, maxSetContentSize, esFileIndex) : ids;
  const truncatedIds = truncateIds(idsWithFamily, maxSetContentSize);

  const payload = {
    alias: tag,
    sharedpublicly,
    is_phantom_manifest,
    content: { ids: truncatedIds, setType: type, sqon, sort, idField },
  } as CreateUpdateBody;

  if (!payload.alias || !payload.content.ids) {
    throw Error(`Set must have ${!payload.alias ? 'a name' : 'no set ids'}`);
  }
  const createResult = await postUserContent(accessToken, payload, usersApiURL);

  const setResult: Set = mapResultToSet(createResult);
  return setResult;
};

export const updateSetTag = async (
  requestBody: UpdateSetTagBody,
  accessToken: string,
  userId: string,
  setId: string,
  usersApiURL: string
): Promise<Set> => {
  const setToUpdate = await getUserSet(accessToken, userId, setId, usersApiURL);

  const payload = {
    alias: requestBody.newTag,
    sharedpublicly: setToUpdate.sharedpublicly,
    content: setToUpdate.content,
  } as CreateUpdateBody;

  const updateResult = await putUserContent(accessToken, payload, setId, usersApiURL);

  const setResult: Set = mapResultToSet(updateResult);
  return setResult;
};

export const updateSetContent = async (
  requestBody: UpdateSetContentBody,
  accessToken: string,
  userId: string,
  setId: string,
  esClient,
  schema,
  usersApiURL: string,
  maxSetContentSize: number
): Promise<Set> => {
  const setToUpdate = await getUserSet(accessToken, userId, setId, usersApiURL);

  const { sqon, ids, setType } = setToUpdate.content;

  const sqonAfterReplace = await resolveSetsInSqon(requestBody.sqon, userId, accessToken, usersApiURL);

  const newSqonIds = await searchSqon(
    sqonAfterReplace,
    setToUpdate.content.setType,
    setToUpdate.content.sort,
    setToUpdate.content.idField,
    esClient,
    schema,
    maxSetContentSize
  );

  if (setType !== setToUpdate.content.setType) {
    throw new Error('Cannot add/remove from a set not of the same type');
  }

  const existingSqonWithNewSqon =
    requestBody.subAction === SubActionTypes.ADD_IDS
      ? addSqonToSetSqon(sqon, requestBody.sqon)
      : removeSqonToSetSqon(sqon, requestBody.sqon);

  const existingIdsWithNewIds =
    requestBody.subAction === SubActionTypes.ADD_IDS ? union(ids, newSqonIds) : difference(ids, newSqonIds);
  const truncatedIds = truncateIds(existingIdsWithNewIds, maxSetContentSize);

  const payload = {
    alias: setToUpdate.alias,
    sharedpublicly: setToUpdate.sharedpublicly,
    content: { ...setToUpdate.content, sqon: existingSqonWithNewSqon, ids: truncatedIds },
  } as CreateUpdateBody;

  const updateResult = await putUserContent(accessToken, payload, setId, usersApiURL);

  const setResult: Set = mapResultToSet(updateResult);
  return setResult;
};

export const deleteSet = async (accessToken: string, setId: string, usersApiURL: string): Promise<boolean> => {
  const deleteResult = await deleteUserContent(accessToken, setId, usersApiURL);
  return deleteResult;
};

const mapResultToSet = (output: Output): Set => ({
  id: output.id,
  tag: output.alias,
  size: output.content.ids.length,
  updated_date: output.updated_date,
  setType: output.content.setType,
  ids: output.content.ids,
  sharedpublicly: output.sharedpublicly,
  is_phantom_manifest: output.is_phantom_manifest,
});

const truncateIds = (ids: string[], maxSetContentSize: number): string[] => {
  if (ids.length <= maxSetContentSize) {
    return ids;
  }
  return dropRight(ids, ids.length - maxSetContentSize);
};
