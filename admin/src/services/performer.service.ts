import { APIRequest } from './api-request';

export class PerformerService extends APIRequest {
  create(payload: any) {
    return this.post('/admin/performers', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/performers/${id}`, payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/performers/search', query));
  }

  findById(id: string) {
    return this.get(`/admin/performers/${id}/view`);
  }

  delete(id: string) {
    return this.del(`/admin/performers/${id}/delete`);
  }

  getUploadDocumentUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/documents/upload`;
  }

  getAvatarUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/avatar/upload`;
  }

  getCoverUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/performers/cover/upload`;
  }

  updateCommissionSetting(id: string, payload: any) {
    return this.put(`/admin/performers/${id}/commission-settings`, payload);
  }

  updateBankingSetting(id: string, payload: any) {
    return this.put(`/admin/performers/${id}/banking-settings`, payload);
  }

  trendingProfiles(query) {
    return this.get(this.buildUrl('/performers-trending/search', query));
  }

  trendingUpdate(payload) {
    return this.post('/performers-trending/update-ordering', payload);
  }

  trendingRemove(id: string) {
    return this.del(`/performers-trending/${id}`);
  }

  trendingCreate(payload: any) {
    return this.post('/performers-trending/create', payload);
  }
}

export const performerService = new PerformerService();
