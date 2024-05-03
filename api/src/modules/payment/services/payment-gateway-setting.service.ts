import { Injectable, Inject } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { STATUS } from 'src/kernel/constants';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { UserDto } from 'src/modules/user/dtos';
import { PaymentGatewaySettingModel } from '../models';
import { PaymentGatewaySettingPayload } from '../payloads/payment-gateway-setting.payload';
import { PAYMENT_GATEWAY_SETTING_MODEL_PROVIDER } from '../providers';

@Injectable()
export class PaymentGatewaySettingService {
  constructor(
    @Inject(PAYMENT_GATEWAY_SETTING_MODEL_PROVIDER)
    private readonly paymentGatewaySettingModel: Model<PaymentGatewaySettingModel>
  ) { }

  public async updatePaymentGateway(payload: PaymentGatewaySettingPayload, user: UserDto) {
    let sourceId = user._id;
    if (user.roles && user.roles.includes('admin') && payload.sourceId) {
      sourceId = toObjectId(payload.sourceId);
    }
    let item = await this.paymentGatewaySettingModel.findOne({
      key: payload.key,
      sourceId
    });
    if (!item) {
      // eslint-disable-next-line new-cap
      item = new this.paymentGatewaySettingModel();
    }
    item.key = payload.key;
    item.source = payload.source;
    item.sourceId = sourceId;
    item.status = STATUS.ACTIVE;
    item.value = payload.value;
    return item.save();
  }

  public async getPaymentSetting(
    sourceId: string | ObjectId,
    service = 'ccbill'
  ) {
    return this.paymentGatewaySettingModel.findOne({
      key: service,
      sourceId
    });
  }
}
