import { IPerformer } from './performer';
import { ISearch } from './utils';

export interface IStory {
  _id?: string;
  type: string;
  fromRef: string;
  refId: string;
  fromSourceId: string;
  performer: IPerformer;
  fromSource: string;
  title: string;
  text: string;
  textColor: string;
  textStyle: any;
  backgroundUrl: string;
  fileIds: Array<string>;
  totalLike: number;
  totalComment: number;
  createdAt: Date;
  updatedAt: Date;
  files: any;
  isLiked: boolean;
}

export interface IStorySearch extends ISearch {
  q: string;
  sort: string;
  sortBy: string;
}
