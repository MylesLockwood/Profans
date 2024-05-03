import {
  HttpCode, HttpStatus, Controller, Get, Injectable
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { UserAdditionalInfoService } from '../services/user-additional-info.service';

@Injectable()
@Controller('user-additional')
export class UserAdditionalInfoController {
  constructor(private readonly userAdditionalInfoService: UserAdditionalInfoService) {}

  @Get('heights')
  @HttpCode(HttpStatus.OK)
  listHeight() {
    return DataResponse.ok(this.userAdditionalInfoService.getHeightList());
  }

  @Get('weights')
  @HttpCode(HttpStatus.OK)
  listWeight() {
    return DataResponse.ok(this.userAdditionalInfoService.getWeightList());
  }
}
