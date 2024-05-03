import { Injectable } from '@nestjs/common';
import { SettingService } from 'src/modules/settings/services';
import axios from 'axios';
import { SETTING_KEYS } from 'src/modules/settings/constants';

@Injectable()
export class RecaptchaService {
  constructor(
    private readonly settingService: SettingService
  ) { }

  public async verifyGoogleRecaptcha(token: string): Promise<any> {
    try {
      const googleReCaptchaSecretKey = await this.settingService.getKeyValue(SETTING_KEYS.GOOGLE_RECAPTCHA_SECRET_KEY);
      const resp = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${googleReCaptchaSecretKey || process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`);
      return resp.data;
    } catch (e) {
      return { success: false };
    }
  }
}
