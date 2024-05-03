import { ICountry, ILangguges, IPhoneCodes } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class UtilsService extends APIRequest {
  private _countries = [] as any;

  async countriesList(): Promise<IResponse<ICountry>> {
    if (this._countries.length) {
      return this._countries;
    }
    const resp = await this.get('/countries/list');
    this._countries = resp;
    return resp;
  }

  languagesList(): Promise<IResponse<ILangguges>> {
    return this.get('/languages/list');
  }

  phoneCodesList(): Promise<IResponse<IPhoneCodes>> {
    return this.get('/phone-codes/list');
  }

  heightList(): Promise<IResponse<string>> {
    return this.get('/user-additional/heights');
  }

  weightList(): Promise<IResponse<string>> {
    return this.get('/user-additional/weights');
  }

  verifyRecaptcha(token: string) {
    return this.post('/re-captcha/verify', { token });
  }
}

export const utilsService = new UtilsService();
