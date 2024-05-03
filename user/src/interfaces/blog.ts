import { IPerformer } from './performer';
import { ISearch } from './utils';

export interface IBlog {
  _id?: string;
  fromRef: string;
  refId: string;
  fromSourceId: string;
  performer: IPerformer;
  fromSource: string;
  title: string;
  text: string;
  fileIds?: Array<string>;
  totalLike: number;
  totalComment: number;
  createdAt: Date;
  updatedAt: Date;
  files?: any;
  isLiked: boolean;
}

export interface IBlogCreate {
  title: string;
  text: string;
  fileIds?: Array<string>;
}

export interface IBlogSearch extends ISearch {
  q: string;
  sort: string;
  sortBy: string;
}
