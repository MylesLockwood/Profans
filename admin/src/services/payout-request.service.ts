import { APIRequest } from './api-request';

class PayoutRequestService extends APIRequest {
  calculate(query) {
    return this.get(this.buildUrl('/payout-requests/admin/stats/calculate', query));
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/payout-requests/search', query));
  }

  delete(id: any) {
    return this.del(`/payout-requests/admin/${id}`);
  }

  detail(id: any) {
    return this.get(`/payout-requests/admin/${id}`);
  }

  update(id: any, payload) {
    return this.put(`/payout-requests/admin/${id}`, payload);
  }
}

export const payoutRequestService = new PayoutRequestService();
