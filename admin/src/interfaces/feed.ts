import { IPerformer } from './performer';
import { ISearch } from './utils';

export interface IFeed {
    _id?: string;
    type: string;
    fromRef: string;
    refId: string;
    fromSourceId: string;
    performer: IPerformer;
    fromSource: string;
    title: string;
    text: string;
    fileIds: Array<string>;
    totalLike: number;
    totalComment: number;
    createdAt: Date;
    updatedAt: Date;
    files: any;
    isLiked: boolean;
    isSale: boolean;
    price: number;
    isSubscribed: boolean;
    isBought: boolean;
    polls: any[];
    pollIds: string[];
    pollExpiredAt: Date;
    isBookMarked: boolean;
    thumbnailUrl: string;
    teaser: any;
}

export interface IFeedCreate {
    name: string;
    description?: string;
    status: string;
}

export interface IFeedUpdate {
    _id: string;
    performerId: string;
    name?: string;
    price?: number;
    status?: string;
    description?: string;
    type: string;
    image?: string;
    performer?: { username: string };
}

export interface IFeedSearch extends ISearch {
    q: string;
    sort: string;
    sortBy: string;
}
