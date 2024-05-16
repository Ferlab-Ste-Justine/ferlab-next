import {
  esBiospecimenIndex,
  esFileIndex,
  esGeneIndex,
  esParticipantIndex,
  esStudyIndex,
  esVariantIndex,
} from 'lib/config';

export const getESIndexFromIndex = ({ graphqlIndex = '' }): string => {
  switch (graphqlIndex) {
    case 'Participant':
      return esParticipantIndex;
    case 'Biospecimen':
      return esBiospecimenIndex;
    case 'File':
      return esFileIndex;
    case 'Variant':
      return esVariantIndex;
    case 'Gene':
      return esGeneIndex;
    case 'Study':
      return esStudyIndex;
  }
};
