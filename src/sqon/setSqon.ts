import { getSets } from '../sets';
import { Set, SetSqon } from '../sets/types';

const setRegex = /^set_id:(.+)$/;

const handleContent = (content: any, sets: Set[], getPathToParticipantId) => {
  const contents = [];
  const firstValue = content?.content?.value ? content.content.value[0] : '';
  const matches = setRegex.exec(firstValue);
  const setId = matches && matches[1] ? matches[1] : null;
  if (setId) {
    const set = sets.find((s) => s.id === setId);
    const newContent = { ...content };
    newContent.content.field = getPathToParticipantId(set.setType);
    newContent.content.value = set.ids;
    contents.push(newContent);
  } else {
    contents.push(content);
  }
  return contents;
};

export const replaceSetByIds = async (sqon: SetSqon, accessToken: string, getPathToParticipantId, usersApiURL) => {
  if (!sqon) {
    throw new Error('Sqon is missing');
  }

  const contents = [];
  const sets = await getSets(accessToken, usersApiURL);

  for (const content of sqon.content) {
    if (Array.isArray(content.content)) {
      for (const deepContent of content.content) {
        contents.push(...handleContent(deepContent, sets, getPathToParticipantId));
      }
    } else {
      contents.push(...handleContent(content, sets, getPathToParticipantId));
    }
  }
  return { op: 'and', content: contents };
};
