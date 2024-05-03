import { IUser } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class UserService extends APIRequest {
  me(headers?: { [key: string]: string }): Promise<IResponse<IUser>> {
    return this.get('/users/me', headers);
  }

  updateMe(payload: any) {
    return this.put('/users', payload);
  }

  create(payload: any) {
    return this.post('/admin/users', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/users/${id}`, payload);
  }

  getAvatarUploadUrl(userId?: string) {
    if (userId) {
      return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/users/${userId}/avatar/upload`;
    }
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/avatar/upload`;
  }

  uploadAvatarUser(file: File, userId?: string) {
    return this.upload(`/admin/users/${userId}/avatar/upload`, [
      { file, fieldname: 'avatar' }
    ]);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/users/search', query));
  }

  findById(id: string) {
    return this.get(`/admin/users/${id}/view`);
  }

  delete(id: string) {
    return this.del(`/admin/users/${id}/delete`);
  }
}

export const userService = new UserService();
