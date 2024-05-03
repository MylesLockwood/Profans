import { APIRequest } from './api-request';

export class StoryService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/stories/performers', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/stories/users', query)
    );
  }

  delete(id: string) {
    return this.del(`/stories/performers/${id}`);
  }

  findById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/stories/performers/${id}`, headers);
  }

  update(id: string, payload: any) {
    return this.put(`/stories/performers/${id}`, payload);
  }

  create(data) {
    return this.post('/stories/performers', data);
  }

  uploadPhoto(file: File, payload: any, onProgress?: Function) {
    return this.upload(
      '/stories/performers/photo/upload',
      [
        {
          fieldname: 'file',
          file
        }
      ],
      {
        onProgress,
        customData: payload
      }
    );
  }

  uploadVideo(file: File, payload: any, onProgress?: Function) {
    return this.upload(
      '/stories/performers/video/upload',
      [
        {
          fieldname: 'file',
          file
        }
      ],
      {
        onProgress,
        customData: payload
      }
    );
  }
}

export const storyService = new StoryService();
