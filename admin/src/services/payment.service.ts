import { IPaymentSearch } from 'src/interfaces';
import { APIRequest } from './api-request';

export class PaymentService extends APIRequest {
  search(query: IPaymentSearch) {
    return this.get(this.buildUrl('/transactions/admin/search', query as any));
  }

  updatePaymentGatewaySetting(payload: any) {
    return this.put('/payment-gateway-settings', payload);
  }

  updateBankingSetting(payload: any) {
    return this.put('/banking-settings', payload);
  }
}

export const paymentService = new PaymentService();
