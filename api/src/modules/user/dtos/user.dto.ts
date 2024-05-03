import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { FileDto } from 'src/modules/file';

export interface IUserResponse {
  _id?: ObjectId;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  avatar?: string;
  status?: string;
  gender?: string;
  balance?: number;
  country?: string;
  verifiedEmail?: boolean;
  twitterConnected?: boolean;
  googleConnected?: boolean;
  isOnline?: boolean;
  stats?: any;
  authorisedCard?: boolean;
  isBlocked?: boolean;
  referralCommission?: number;
}

export class UserDto {
  _id: ObjectId;

  name?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  roles: string[] = ['user'];

  avatarId?: string | ObjectId;

  stats: {
    totalViewTime: number;
  }

  avatarPath?: string;

  status?: string;

  username?: string;

  gender?: string;

  balance?: number;

  country?: string; // iso code

  verifiedEmail?: boolean;

  isOnline?: boolean;

  twitterConnected?: boolean;

  googleConnected?: boolean;

  isPerformer?: boolean;

  authorisedCard?: boolean;

  ccbillCardToken?: string;

  isBlocked?: boolean;

  referralCommission?: number;

  paypalSetting?: any;

  bankingSetting?: any;

  constructor(data?: Partial<UserDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'name',
          'firstName',
          'lastName',
          'email',
          'phone',
          'roles',
          'avatarId',
          'avatarPath',
          'status',
          'username',
          'gender',
          'balance',
          'country',
          'verifiedEmail',
          'isOnline',
          'stats',
          'twitterConnected',
          'googleConnected',
          'isPerformer',
          'authorisedCard',
          'ccbillCardToken',
          'isBlocked',
          'referralCommission',
          'paypalSetting',
          'bankingSetting'
        ])
      );
  }

  getName() {
    if (this.name) return this.name;
    return [this.firstName || '', this.lastName || ''].join(' ');
  }

  toResponse(includePrivateInfo = false, isAdmin?: boolean): IUserResponse {
    const publicInfo = {
      _id: this._id,
      name: this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isOnline: this.isOnline,
      stats: this.stats,
      twitterConnected: this.twitterConnected,
      googleConnected: this.googleConnected,
      isPerformer: this.isPerformer,
      isBlocked: this.isBlocked
    };

    const privateInfo = {
      ccbillCardToken: this.ccbillCardToken,
      authorisedCard: this.authorisedCard,
      phone: this.phone,
      status: this.status,
      gender: this.gender,
      balance: this.balance,
      country: this.country,
      roles: this.roles,
      verifiedEmail: this.verifiedEmail,
      referralCommission: this.referralCommission,
      paypalSetting: this.paypalSetting,
      bankingSetting: this.bankingSetting
    };

    if (isAdmin) {
      return {
        ...publicInfo,
        ...privateInfo
      };
    }

    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      ...privateInfo
    };
  }
}
