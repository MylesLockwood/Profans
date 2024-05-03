export interface IPayoutRequest {
  _id: any;
  source: string;
  sourceId: string;
  sourceInfo: any;
  paymentAccountType: string;
  paymentAccountInfo: any;
  requestNote: string;
  requestPrice: number;
  adminNote: string;
  status: string;
  fromDate: Date;
  toDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
