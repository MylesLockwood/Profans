import cookie from 'js-cookie';
import {
  ILogin, IFanRegister, IForgot, IVerifyEmail
} from 'src/interfaces';
import { APIRequest, TOKEN } from './api-request';

export class AuthService extends APIRequest {
  public async login(data: ILogin) {
    return this.post('/auth/login', data);
  }

  public async loginTwitter() {
    return this.get(
      this.buildUrl('/auth/twitter/login')
    );
  }

  public async loginGoogle(data: any) {
    return this.post('/auth/google/login', data);
  }

  public async callbackLoginTwitter(data) {
    return this.get(
      this.buildUrl('/auth/twitter/callback', data)
    );
  }

  public async verifyEmail(data: IVerifyEmail) {
    return this.post('/auth/email-verification', data);
  }

  setToken(token: string, remember = false): void {
    const expired = { expires: !remember ? 1 : 365 };
    cookie.set(TOKEN, token, expired);
    this.setAuthHeaderToken(token);
  }

  getToken(): string {
    return cookie.get(TOKEN);
  }

  setTwitterToken(data: any) {
    process.browser && localStorage.setItem('oauthToken', data.oauthToken);
    process.browser && localStorage.setItem('oauthTokenSecret', data.oauthTokenSecret);
    // https://github.com/js-cookie/js-cookie
    // since Safari does not support, need a better solution
    cookie.set('oauthToken', data.oauthToken);
    cookie.set('oauthTokenSecret', data.oauthTokenSecret);
  }

  getTwitterToken() {
    let oauthToken = cookie.get('oauthToken');
    let oauthTokenSecret = cookie.get('oauthTokenSecret');
    if (oauthToken && oauthTokenSecret) {
      return { oauthToken, oauthTokenSecret };
    }
    oauthToken = !oauthToken && process.browser ? localStorage.getItem('oauthToken') : null;
    oauthTokenSecret = !oauthTokenSecret && process.browser ? localStorage.getItem('oauthTokenSecret') : null;
    return { oauthToken, oauthTokenSecret };
  }

  removeToken(): void {
    cookie.remove(TOKEN);
  }

  updatePassword(password: string, type?: string, source?: string) {
    return this.put('/auth/users/me/password', { type, password, source });
  }

  resetPassword(data: IForgot) {
    return this.post('/auth/users/forgot', data);
  }

  register(data: IFanRegister) {
    return this.post('/auth/users/register', data);
  }

  registerPerformer(documents: {
    file: File;
    fieldname: string;
  }[], data: any, onProgress?: Function) {
    return this.upload('/auth/performers/register', documents, {
      onProgress,
      customData: data
    });
  }

  userSwitchToPerformer(userId: string) {
    return this.post(`/auth/users/${userId}/switch-to-performer`);
  }
}

export const authService = new AuthService();
