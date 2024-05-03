import {
  Injectable, Inject
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { UserDto } from 'src/modules/user/dtos';
import { BankingSettingModel } from '../models';
import { BankingSettingPayload } from '../payloads';
import { BANKING_SETTING_MODEL_PROVIDER } from '../providers';

@Injectable()
export class BankingSettingService {
  constructor(
    @Inject(BANKING_SETTING_MODEL_PROVIDER)
    private readonly bankingSettingModel: Model<BankingSettingModel>
  ) { }

  public async updateBankingSetting(
    payload: BankingSettingPayload,
    user: UserDto
  ) {
    let sourceId = user._id;
    if (user.roles && user.roles.includes('admin') && payload.sourceId) {
      sourceId = toObjectId(payload.sourceId);
    }
    let item = await this.bankingSettingModel.findOne({
      sourceId
    });
    if (!item) {
      // eslint-disable-next-line new-cap
      item = new this.bankingSettingModel(payload);
    }
    item.sourceId = sourceId;
    item.firstName = payload.firstName;
    item.lastName = payload.lastName;
    item.SSN = payload.SSN;
    item.bankName = payload.bankName;
    item.bankAccount = payload.bankAccount;
    item.bankRouting = payload.bankRouting;
    item.bankSwiftCode = payload.bankSwiftCode;
    item.address = payload.address;
    item.city = payload.city;
    item.state = payload.state;
    item.country = payload.country;
    return item.save();
  }

  public async getBankingSetting(
    sourceId: string | ObjectId
  ) {
    return this.bankingSettingModel.findOne({
      sourceId
    });
  }
}
