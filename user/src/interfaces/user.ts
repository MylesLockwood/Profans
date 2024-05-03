import { ISearch } from './utils';

export interface IUser {
  _id: string;
  avatar: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
  isPerformer: boolean;
  isOnline: boolean;
  verifiedEmail: boolean;
  verifiedAccount: boolean;
  twitterConnected: boolean;
  googleConnected: boolean;
  cover: string;
  dateOfBirth: Date;
  verifiedDocument: boolean;
  authorisedCard: boolean;
  referralCommission: boolean;
  paypalSetting: any;
  bankingSetting: any;
}

export interface IUserFormData {
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface IUserSearch extends ISearch {
  roles: string[];
}
