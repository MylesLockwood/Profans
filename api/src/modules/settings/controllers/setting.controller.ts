import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { SettingService } from '../services';

@Injectable()
@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('/public')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPublicSettings(): Promise<DataResponse<Map<string, any>>> {
    const data = await this.settingService.getPublicSettings();
    return DataResponse.ok(data);
  }
}
