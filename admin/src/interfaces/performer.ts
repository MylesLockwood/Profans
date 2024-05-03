interface document {
  _id: string;
  url: string;
  mimeType: string;
}

export interface ValueSchedule {
  start: string;
  end: string;
  closed: boolean;
}

export interface ISchedule {
  mon: ValueSchedule;
  tue: ValueSchedule;
  wed: ValueSchedule;
  thu: ValueSchedule;
  fri: ValueSchedule;
  sat: ValueSchedule;
  sun: ValueSchedule;
}

export interface IPerformer {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
}

export interface ITrendingPerformer {
  _id: string;
  name: string;

  firstName: string;

  lastName: string;

  username: string;

  dateOfBirth: Date;

  avatarId: string;

  avatarPath: string;

  coverId: string;

  coverPath: string;

  welcomeVideoId: string;

  welcomeVideoPath: string;

  activateWelcomeVideo: boolean;

  verifiedAccount: boolean;

  gender: string;

  country: string;

  bio: string;

  createdAt: Date;

  updatedAt: Date;

  totalSubscribersInDay: number;

  performerId: string;

  listType: string;

  isProtected: boolean;

  ordering: number;
}

export interface IBanking {
  firstName: string;
  lastName: string;
  SSN: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
  bankSwiftCode: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface IPerformerCreate {
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  country: string;
  status: string;
  gender: string;
  languages: string[];
  phone: string;
  phoneCode: string;
  city: string;
  state: string;
  address: string;
  zipcode: string;
  schedule: ISchedule;
  bankingInformation: IBankingSetting;
  monthyPrice: number;
  yearlyPrice: number;
  verifiedEmail: boolean;
  verifiedAccount: boolean;
}

export interface IPerformerUpdate {
  _id: string;
  isFreeSubscription: boolean;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  country: string;
  status: string;
  gender: string;
  languages: string[];
  phone: string;
  phoneCode: string;
  city: string;
  state: string;
  address: string;
  zipcode: string;
  avatar: string;
  cover: string;
  idVerification: document;
  documentVerification: document;
  schedule: ISchedule;
  monthyPrice: number;
  yearlyPrice: number;
  commissionSetting: ICommissionSetting;
  verifiedEmail: boolean;
  verifiedAccount: boolean;
  verifiedDocument: boolean;
  bodyType: string;
  dateOfBirth: Date;
  paypalSetting: any;
  ccbillSetting: CCBillPaymentGateway;
  bankingSetting: IBankingSetting;
}

export interface CCBillPaymentGateway {
  subscriptionSubAccountNumber: string;
  singlePurchaseSubAccountNumber: string;
}

export interface IPaymentGatewaySetting {
  source: string;
  sourceId: string;
  key: string;
  status: string;
  value: any;
}

export interface ICommissionSetting {
  monthlySubscriptionCommission: number;
  yearlySubscriptionCommission: number;
  videoSaleCommission: number;
  productSaleCommission: number;
  referralCommission: number
}

export interface IBankingSetting {
  firstName: string;
  lastName: string;
  SSN: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
  bankSwiftCode: string;
  address: string;
  city: string;
  state: string;
  country: string;
  performerId: string;
}
