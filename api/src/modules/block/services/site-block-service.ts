import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityNotFoundException } from 'src/kernel';
import { SiteBlockCountryModel } from '../models';
import { SITE_BLOCK_COUNTRY_PROVIDER } from '../providers';
import {
  BlockCountryCreatePayload
} from '../payloads';

@Injectable()
export class SiteBlockCountryService {
  constructor(
    @Inject(SITE_BLOCK_COUNTRY_PROVIDER)
    private readonly blockCountryModel: Model<SiteBlockCountryModel>
  ) {}

  public async create(payload: BlockCountryCreatePayload): Promise<any> {
    const country = await this.blockCountryModel.findOne({ countryCode: payload.countryCode });
    if (country) {
      return 'ALREADY_BLOCKED';
    }
    return this.blockCountryModel.create({
      countryCode: payload.countryCode,
      createdAt: new Date()
    });
  }

  public async search(): Promise<any> {
    return this.blockCountryModel.find({});
  }

  public async delete(code): Promise<any> {
    const country = await this.blockCountryModel.findOne({ countryCode: code });
    if (!country) {
      throw new EntityNotFoundException();
    }
    await country.remove();
    return true;
  }

  public async checkCountryBlock(countryCode) {
    const country = await this.blockCountryModel.countDocuments({ countryCode });

    return { blocked: country > 0 };
  }
}
