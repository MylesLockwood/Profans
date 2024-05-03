import { IPerformer } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class PerformerService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/search', query));
  }

  randomSearch(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/search/random', query));
  }

  me(headers?: { [key: string]: string }): Promise<IResponse<IPerformer>> {
    return this.get('/performers/me', headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performers/${id}`, headers);
  }

  getAvatarUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/avatar/upload`;
  }

  getCoverUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/cover/upload`;
  }

  getVideoUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/welcome-video/upload`;
  }

  getDocumentUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/documents/upload`;
  }

  updateMe(id: string, payload: any) {
    return this.put(`/performers/${id}`, payload);
  }

  getTopPerformer(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/top', query));
  }

  getBookmarked(payload) {
    return this.get(this.buildUrl('/reactions/performers/bookmark', payload));
  }

  trendingProfiles(query) {
    return this.get(this.buildUrl('/performers-trending/search', query));
  }

  randomTrendingProfiles(query) {
    return this.get(this.buildUrl('/performers-trending/random-search', query));
  }

  uploadDocuments(documents: {
    file: File;
    fieldname: string;
  }[], onProgress?: Function) {
    return this.upload('/performers/documents/upload', documents, {
      onProgress
    });
  }
}

export const performerService = new PerformerService();
