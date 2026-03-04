export interface Revision {
  _id: string;
  body: string;
  createdAt: string;
}

export interface RevisionWithNo extends Revision {
  revisionNo: number;
  label: string;
}

export type DiffMode = 'markdown' | 'html';
