import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel/common';
import { PerformerBlockService } from 'src/modules/block/services';
import { UserModel } from '../models';
import { USER_MODEL_PROVIDER } from '../providers';
import { UserDto } from '../dtos';
import { UserSearchRequestPayload } from '../payloads';
import { ROLE_ADMIN, STATUS_ACTIVE } from '../constants';

@Injectable()
export class UserSearchService {
  constructor(
    @Inject(forwardRef(() => PerformerBlockService))
    private readonly performerBlockService: PerformerBlockService,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>
  ) {}

  // TODO - should create new search service?
  public async search(
    req: UserSearchRequestPayload
  ): Promise<PageableData<UserDto>> {
    const query = {} as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      query.$or = [
        {
          name: { $regex: regexp }
        },
        {
          username: { $regex: regexp }
        },
        {
          email: { $regex: regexp }
        }
      ];
    }
    if (req.role) {
      query.roles = { $in: [req.role] };
    }
    if (req.status) {
      query.status = req.status;
    }
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.userModel.countDocuments(query)
    ]);
    return {
      data: data.map((item) => new UserDto(item)),
      total
    };
  }

  public async performerSearch(
    req: UserSearchRequestPayload,
    user: UserDto
  ): Promise<PageableData<UserDto>> {
    const query = {
      status: STATUS_ACTIVE,
      roles: { $ne: ROLE_ADMIN }
    } as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      query.$or = [
        {
          name: { $regex: regexp }
        },
        {
          username: { $regex: regexp }
        }
      ];
    }
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.userModel.countDocuments(query)
    ]);

    const users = data.map((d) => new UserDto(d));
    const userIds = data.map((d) => d._id);
    const blockUserList = await this.performerBlockService.listByQuery({
      sourceId: user._id,
      targetId: { $in: userIds }
    });
    users.forEach((u) => {
      const isBlocked = blockUserList.find((b) => `${b.targetId}` === `${u._id}`);
      // eslint-disable-next-line no-param-reassign
      u.isBlocked = !!isBlocked;
    });
    return {
      data: users,
      total
    };
  }

  public async searchByKeyword(
    req: UserSearchRequestPayload
  ): Promise<any> {
    const query = {} as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      query.$or = [
        {
          name: { $regex: regexp }
        },
        {
          email: { $regex: regexp }
        },
        {
          username: { $regex: regexp }
        }
      ];
    }
    const [data] = await Promise.all([
      this.userModel
        .find(query)
    ]);
    return data;
  }
}
