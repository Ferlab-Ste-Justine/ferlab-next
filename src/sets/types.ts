export type SetSqon = {
  op: string;
  content: any; // Since SQON is generic, it is too complex to define an explicit type for its content.
};

export type Sort = {
  field: string;
  order: string;
};

export type CreateSetBody = {
  projectId: string;
  type: string;
  sqon: SetSqon;
  idField: string;
  sort: Sort[];
  tag: string;
  sharedpublicly: boolean;
  is_phantom_manifest: boolean;
  withFamily?: boolean;
  is_invisible?: boolean;
};

export type UpdateSetTagBody = {
  subAction: string;
  sourceType: string;
  newTag: string;
};

export type UpdateSetContentBody = {
  subAction: string;
  sourceType: string;
  sqon: SetSqon;
  projectId: string;
};

export type Set = {
  id: string;
  tag: string;
  size: number;
  updated_date: Date;
  setType: string;
  ids: string[];
  sharedpublicly: boolean;
  is_phantom_manifest: boolean;
  is_invisible?: boolean;
};
