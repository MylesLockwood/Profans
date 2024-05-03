import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { SETTING_KEYS } from 'src/constants';
import { updateSettings } from './actions';

// TODO -
const initialState = {
  [SETTING_KEYS.GOOGLE_RECAPTCHA_SITE_KEY]: '',
  [SETTING_KEYS.ENABLE_GOOGLE_RECAPTCHA]: false,
  [SETTING_KEYS.GOOGLE_CLIENT_ID]: '',
  [SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION]: false,
  [SETTING_KEYS.REFERRAL_COMMISSION]: 0.05
};

const settingReducers = [
  {
    on: updateSettings,
    reducer(state: any, data: any) {
      return {
        ...data.payload
      };
    }
  }
];

export default merge({}, createReducers('settings', [settingReducers], initialState));
