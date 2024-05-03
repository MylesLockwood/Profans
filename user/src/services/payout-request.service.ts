import { APIRequest } from './api-request';

class PayoutRequestService extends APIRequest {
  calculate(query) {
    return this.get(this.buildUrl('/payout-requests/user/calculate', query));
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/payout-requests/user/search', query));
  }

  create(body: any) {
    return this.post('/payout-requests/user', body);
  }

  update(id: string, body: any) {
    return this.put(`/payout-requests/user/${id}`, body);
  }

  detail(
    id: string,
    headers: {
      [key: string]: string;
    }
  ): Promise<any> {
    return this.get(`/payout-requests/user/${id}/view`, headers);
  }
}

export const payoutRequestService = new PayoutRequestService();
