import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import axios from 'axios';
import { SUBSCRIPTION_TYPE } from '../../subscription/constants';

const crypto = require('crypto');

interface CCbillChargeByPreviousTransaction {
  username: string;
  password: string;
  subAccountNumber: string;
  ccbillClientAccNo: string;
  price: number;
  subscriptionType?: string;
  transactionId: string | ObjectId;
  subscriptionId: string;
}

interface CCBillAuthoriseCard {
  salt: string;
  flexformId: string;
  subAccountNumber: string;
  transactionId: string | ObjectId;
  price: number;
  currencyCode?: string;
}
interface ICCBillCancelSubscription {
  subscriptionId: string;
  ccbillClientAccNo: string,
  ccbillDatalinkUsername: string;
  ccbillDatalinkPassword: string;
}

@Injectable()
export class CCBillService {
  public async subscription(options: CCbillChargeByPreviousTransaction) {
    const {
      username, password, ccbillClientAccNo, subAccountNumber, subscriptionId, transactionId
    } = options;
    const initialPrice = options.price.toFixed(2);
    const initialPeriod = options.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY ? 30 : 365;
    const currencyCode = '840'; // usd
    if (!username || !password || ccbillClientAccNo || !subAccountNumber || !initialPrice || !subscriptionId || !transactionId) {
      throw new EntityNotFoundException();
    }

    const resp = await axios.get(`https://bill.ccbill.com/jpost/billingApi.cgi?clientAccnum=${ccbillClientAccNo}&clientSubacc=${subAccountNumber}&username=${username}&password=${password}&action=chargeByPreviousTransactionId&newClientAccnum=${ccbillClientAccNo}&newClientSubacc=${subAccountNumber}&sharedAuthentication=1&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&recurringPrice=${initialPrice}&recurringPeriod=${initialPeriod}&rebills=99&subscriptionId=${subscriptionId}&currencyCode=${currencyCode}&transactionId=${transactionId}`);
    return resp?.data?.includes('"approved"\n"1"\n');
  }

  public async singlePurchase(options: CCbillChargeByPreviousTransaction) {
    const {
      username, password, ccbillClientAccNo, subAccountNumber, subscriptionId, transactionId
    } = options;
    const initialPrice = options.price.toFixed(2);
    const initialPeriod = 0;
    const currencyCode = '840'; // usd
    if (!username || !password || ccbillClientAccNo || !subAccountNumber || !initialPrice || !subscriptionId || !transactionId) {
      throw new EntityNotFoundException();
    }

    const resp = await axios.get(`https://bill.ccbill.com/jpost/billingApi.cgi?clientAccnum=${ccbillClientAccNo}&clientSubacc=${subAccountNumber}&username=${username}&password=${password}&action=chargeByPreviousTransactionId&newClientAccnum=${ccbillClientAccNo}&newClientSubacc=${subAccountNumber}&sharedAuthentication=1&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&rebills=99&subscriptionId=${subscriptionId}&currencyCode=${currencyCode}&transactionId=${transactionId}`);
    return resp?.data?.includes('"approved"\n"1"\n');
  }

  public authoriseCard(options: CCBillAuthoriseCard) {
    const {
      transactionId, salt, flexformId, subAccountNumber, currencyCode: currency
    } = options;
    const initialPrice = options.price.toFixed(2);
    const currencyCode = currency || '840';
    const initialPeriod = 0;
    if (!salt || !flexformId || !subAccountNumber || !transactionId || !initialPrice) {
      throw new EntityNotFoundException();
    }
    const formDigest = crypto.createHash('md5')
      .update(`${initialPrice}${initialPeriod}${currencyCode}${salt}`)
      .digest('hex');
    return {
      paymentUrl: `https://api.ccbill.com/wap-frontflex/flexforms/${flexformId}?transactionId=${transactionId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&clientSubacc=${subAccountNumber}&currencyCode=${currencyCode}&formDigest=${formDigest}`
    };
  }

  public async cancelSubscription(options: ICCBillCancelSubscription) {
    const ccbillCancelUrl = 'https://datalink.ccbill.com/utils/subscriptionManagement.cgi';
    const {
      subscriptionId, ccbillClientAccNo, ccbillDatalinkUsername, ccbillDatalinkPassword
    } = options;
    const resp = await axios.get(`${ccbillCancelUrl}?subscriptionId=${subscriptionId}&username=${ccbillDatalinkUsername}&password=${ccbillDatalinkPassword}&action=cancelSubscription&clientAccnum=${ccbillClientAccNo}`);
    return resp?.data?.includes('"results"\n"1"\n');
  }
}
