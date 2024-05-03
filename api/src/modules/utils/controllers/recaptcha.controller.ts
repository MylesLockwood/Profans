import {
  HttpCode,
  HttpStatus,
  Controller,
  Post,
  Injectable,
  ValidationPipe,
  UsePipes,
  Body
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { RecaptchaService } from '../services';

@Injectable()
@Controller('re-captcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: { token: string }
  ): Promise<DataResponse<any>> {
    const data = await this.recaptchaService.verifyGoogleRecaptcha(payload.token);
    return DataResponse.ok(data);
  }
}
