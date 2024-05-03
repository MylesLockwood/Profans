import { APIRequest } from './api-request';

export class BlogService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/blogs/performers', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/blogs/users', query)
    );
  }

  delete(id: string) {
    return this.del(`/blogs/performers/${id}`);
  }

  findById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/blogs/performers/${id}`, headers);
  }

  userFindById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/blogs/users/${id}`, headers);
  }

  update(id: string, payload: any) {
    return this.put(`/blogs/performers/${id}`, payload);
  }

  create(data) {
    return this.post('/blogs/performers', data);
  }

  uploadPhoto(file: File, payload: any, onProgress?: Function) {
    return this.upload(
      '/blogs/performers/photo/upload',
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
      '/blogs/performers/video/upload',
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

export const blogService = new BlogService();
