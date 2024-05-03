import {
  HttpCode,
  HttpStatus,
  Controller,
  Injectable,
  UseGuards,
  Post,
  Delete,
  Param,
  Body,
  Get
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { SiteBlockCountryService } from '../services';
import { BlockCountryCreatePayload } from '../payloads/site-block-country.payload';

@Injectable()
@Controller('admin/block/countries')
export class SiteBlockCountryController {
  constructor(private readonly blockCountryService: SiteBlockCountryService) {}

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async search(
  ): Promise<DataResponse<any>> {
    const search = await this.blockCountryService.search();
    return DataResponse.ok(search);
  }

  @Post('/')
  @Roles('admin')
  @UseGuards(RoleGuard)
  async createUser(
    @Body() payload: BlockCountryCreatePayload
  ): Promise<DataResponse<any>> {
    const resp = await this.blockCountryService.create(payload);

    return DataResponse.ok(resp);
  }

  @Delete('/:code')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('code') countryCode: string): Promise<DataResponse<boolean>> {
    const deleted = await this.blockCountryService.delete(countryCode);
    return DataResponse.ok(deleted);
  }
}
