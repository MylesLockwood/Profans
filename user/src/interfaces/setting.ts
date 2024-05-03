export interface ISetting {
  googleReCaptchaSiteKey: string;
  enableGoogleReCaptcha: boolean;
  requireEmailVerification: boolean;
  googleClientId: string;
  referralCommission: number;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}
