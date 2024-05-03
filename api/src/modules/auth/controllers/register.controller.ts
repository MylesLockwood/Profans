import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  Get,
  Res,
  Query,
  Param
} from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import { DataResponse } from 'src/kernel';
import { UserCreatePayload } from 'src/modules/user/payloads';
import { SettingService } from 'src/modules/settings';
import { STATUS_PENDING_EMAIL_CONFIRMATION, STATUS_ACTIVE, ROLE_USER } from 'src/modules/user/constants';
// import { isObjectId } from 'src/kernel/helpers/string.helper';
// import { ReferralReportService } from 'src/modules/referral-report/services';
import { AuthCreateDto } from '../dtos';
import { UserRegisterPayload, EmailVerificationPayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth')
export class RegisterController {
  constructor(
    // @Inject(forwardRef(() => ReferralReportService))
    // private readonly referralReportService: ReferralReportService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Post('users/register')
  @HttpCode(HttpStatus.OK)
  async userRegister(
    @Body() payload: UserRegisterPayload
    // @Request() req: any
  ): Promise<DataResponse<{ message: string }>> {
    const requireEmailVerification = SettingService.getValueByKey(
      'requireEmailVerification'
    );

    const user = await this.userService.create(new UserCreatePayload(payload), {
      status: requireEmailVerification
        ? STATUS_PENDING_EMAIL_CONFIRMATION
        : STATUS_ACTIVE,
      roles: ROLE_USER
    });
    await Promise.all([
      payload.email && this.authService.create(new AuthCreateDto({
        source: 'user',
        sourceId: user._id,
        type: 'username',
        value: payload.password,
        key: payload.email
      })),
      payload.username && this.authService.create(new AuthCreateDto({
        source: 'user',
        sourceId: user._id,
        type: 'username',
        value: payload.password,
        key: payload.username
      }))
    ]);

    // if (payload.rel && isObjectId(payload.rel)) {
    //   await this.referralReportService.create({
    //     registerSource: 'user',
    //     registerId: user._id,
    //     referralSource: payload.relSource || 'user',
    //     referralId: payload.rel
    //   }, req);
    // }

    user.email && await this.authService.sendVerificationEmail({
      _id: user._id,
      email: user.email
    });

    return DataResponse.ok({ message: 'We have sent you a verification email please check your email account you registered with' });
  }

  @Post('email-verification')
  @HttpCode(HttpStatus.OK)
  async emailVerify(
    @Body() payload: EmailVerificationPayload
  ): Promise<DataResponse<{ message: string }>> {
    await this.authService.sendVerificationEmail(payload.source);
    return DataResponse.ok({
      message: 'We have sent you a verification email please check your email account you registered with'
    });
  }

  @Get('email-verification')
  public async verifyEmail(
    @Res() res: any,
    @Query('token') token: string
  ) {
    if (!token) {
      return res.render('404.html');
    }
    await this.authService.verifyEmail(token);
    if (process.env.EMAIL_VERIFIED_SUCCESS_URL) {
      return res.redirect(process.env.EMAIL_VERIFIED_SUCCESS_URL);
    }
    return res.redirect(`${process.env.USER_URL}`);
  }

  @Post('users/:id/switch-to-performer')
  @HttpCode(HttpStatus.OK)
  async userSwitchAccount(
    @Param('id') userId: string
  ): Promise<DataResponse<{ message: string }>> {
    const data = await this.authService.switchUserAccount(userId);
    return DataResponse.ok(data);
  }
}
