import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  HttpException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { PERFORMER_STATUSES } from 'src/modules/performer/constants';
import { SettingService } from 'src/modules/settings';
import {
  PasswordIncorrectException,
  EmailNotVerifiedException
} from '../exceptions';
import { LoginByUsernamePayload, LoginByEmailPayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth')
export class PerformerLoginController {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly authService: AuthService
  ) { }

  @Post('performers/login/username')
  @HttpCode(HttpStatus.OK)
  public async loginByUsername(
    @Body() req: LoginByUsernamePayload
  ): Promise<DataResponse<{ token: string }>> {
    const auth = await this.authService.findBySource({
      source: 'performer',
      type: 'username',
      key: req.username
    });
    if (!auth) {
      throw new HttpException('This account is not found. Please Sign up', 404);
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new PasswordIncorrectException();
    }

    const performer = await this.performerService.findById(auth.sourceId);
    if (!performer) {
      throw new HttpException('This account is not found. Please Sign up', 404);
    }
    if (
      (SettingService.getValueByKey('requireEmailVerification') && performer.status === PERFORMER_STATUSES.PENDING)
      || (SettingService.getValueByKey('requireEmailVerification') && !performer.verifiedEmail)
    ) {
      throw new EmailNotVerifiedException();
    }

    if (performer.status === PERFORMER_STATUSES.PENDING) {
      throw new HttpException('Please verify your email', 400);
    } else if (performer.status === PERFORMER_STATUSES.INACTIVE) {
      throw new HttpException('Please wait for the admin to approve your account', 403);
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth)
    });
  }

  @Post('performers/login/email')
  @HttpCode(HttpStatus.OK)
  public async loginByEmail(
    @Body() req: LoginByEmailPayload
  ): Promise<DataResponse<{ token: string }>> {
    const auth = await this.authService.findBySource({
      source: 'performer',
      type: 'email',
      key: req.email
    });
    if (!auth) {
      throw new HttpException('This account is not found. Please Sign up', 400);
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new PasswordIncorrectException();
    }

    const performer = await this.performerService.findById(auth.sourceId);
    if (!performer) {
      throw new HttpException('This account is not found. Please Sign up', 400);
    }
    if (
      (SettingService.getValueByKey('requireEmailVerification') && performer.status === PERFORMER_STATUSES.PENDING)
      || (SettingService.getValueByKey('requireEmailVerification') && !performer.verifiedEmail)
    ) {
      throw new EmailNotVerifiedException();
    }
    if (performer.status === PERFORMER_STATUSES.PENDING) {
      throw new HttpException('Please verify your email', 400);
    } else if (performer.status === PERFORMER_STATUSES.INACTIVE) {
      throw new HttpException('Please wait for the admin to approve your account', 403);
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth)
    });
  }
}
