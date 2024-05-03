import {
  Injectable, Inject, forwardRef, ForbiddenException
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { FileDto } from 'src/modules/file';
import {
  EntityNotFoundException, StringHelper, QueueEventService,
  QueueEvent
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { AuthService } from 'src/modules/auth/services';
import { PerformerService } from 'src/modules/performer/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { BankingSettingService, PaymentGatewaySettingService } from 'src/modules/payment/services';
import { randomString } from 'src/kernel/helpers/string.helper';
import { UserModel } from '../models';
import { USER_MODEL_PROVIDER } from '../providers';
import {
  UserUpdatePayload, UserAuthUpdatePayload, UserAuthCreatePayload, UserCreatePayload
} from '../payloads';
import { UserDto } from '../dtos';
import { DELETE_USER_CHANNEL, STATUS_ACTIVE } from '../constants';
import { EmailHasBeenTakenException } from '../exceptions';
import { UsernameExistedException } from '../exceptions/username-existed.exception';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => PaymentGatewaySettingService))
    private readonly paymentGatewaySettingService: PaymentGatewaySettingService,
    @Inject(forwardRef(() => BankingSettingService))
    private readonly bankingSettingService: BankingSettingService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>,
    private readonly queueEventService: QueueEventService
  ) {}

  public async find(params: any): Promise<UserModel[]> {
    return this.userModel.find(params);
  }

  public async findOne(params: any): Promise<UserModel> {
    return this.userModel.findOne(params);
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    if (!email) {
      return null;
    }
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  public async findById(id: string | ObjectId): Promise<UserModel> {
    return this.userModel.findById(id);
  }

  public async getDetails(id: string | ObjectId) {
    const user = await this.userModel.findById(id);
    if (!user) throw new EntityNotFoundException();
    const dto = new UserDto(user);
    dto.paypalSetting = await this.paymentGatewaySettingService.getPaymentSetting(user._id, 'paypal');
    dto.bankingSetting = await this.bankingSettingService.getBankingSetting(user._id);
    return dto;
  }

  public async getMe(authUser: any, jwToken: string): Promise<any> {
    if (authUser.source === 'user') {
      return this.getDetails(authUser.sourceId);
    }
    const performer = await this.performerService.getDetails(authUser.sourceId, jwToken);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    return new PerformerDto(performer).toResponse(true);
  }

  public async findByUsername(username: string): Promise<UserDto> {
    const newUsername = username.trim().toLowerCase();
    const user = await this.userModel.findOne({ username: newUsername });
    return user ? new UserDto(user) : null;
  }

  public async findByIds(ids: any[]): Promise<UserDto[]> {
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();
    return users.map((u) => new UserDto(u));
  }

  public async checkExistedEmailorUsername(payload) {
    const data = payload.username ? await this.userModel.countDocuments({ username: payload.username.trim() })
      : await this.userModel.countDocuments({ email: payload.email.toLowerCase() });
    return data;
  }

  public async create(data: UserCreatePayload | UserAuthCreatePayload, options = {} as any): Promise<UserModel> {
    if (!data || !data.email) {
      throw new EntityNotFoundException();
    }
    const countUserEmail = await this.userModel.countDocuments({
      email: data.email.toLowerCase()
    });
    const countPerformerEmail = await this.performerService.checkExistedEmailorUsername({ email: data.email });
    if (countUserEmail || countPerformerEmail) {
      throw new EmailHasBeenTakenException();
    }
    const countUserUsername = data.username && await this.findByUsername(data.username);
    const countPerformerUsername = data.username && await this.performerService.checkExistedEmailorUsername({ username: data.username });
    if (countUserUsername || countPerformerUsername) {
      throw new UsernameExistedException();
    }
    const user = { ...data } as any;
    user.email = data.email.toLowerCase();
    user.username = data.username ? data.username.trim() : `user${randomString(8, '1234567890')}`;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.roles = options.roles || ['user'];
    user.status = options.status || STATUS_ACTIVE;
    if (!user.name) {
      user.name = [user.firstName || '', user.lastName || ''].join(' ');
    }
    return this.userModel.create(user);
  }

  public async socialCreate(data): Promise<UserModel> {
    if (!data.name) {
      // eslint-disable-next-line no-param-reassign
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }
    return this.userModel.create(data);
  }

  public async update(id: string | ObjectId, payload: UserUpdatePayload, user?: UserDto): Promise<any> {
    const data = { ...payload } as any;
    delete data.referralCommission;
    const eUser = await this.userModel.findById(id);
    if (!eUser) {
      throw new EntityNotFoundException();
    }
    if (user && !user.roles.includes('admin') && `${user._id}` !== `${id}`) {
      throw new ForbiddenException();
    }
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }
    if (data.username && data.username !== eUser.username) {
      const countUserUsername = await this.userModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: eUser._id }
      });
      const countPerformerUsername = await this.performerService.checkExistedEmailorUsername({ username: data.username });
      if (countUserUsername || countPerformerUsername) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }
    if (data.email && data.email !== eUser.email) {
      const countUserEmail = await this.userModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: { $ne: eUser._id }
      });
      const countPerformerEmail = await this.performerService.checkExistedEmailorUsername({ email: data.email });
      if (countUserEmail || countPerformerEmail) {
        throw new EmailHasBeenTakenException();
      }
      data.email = data.email.toLowerCase();
      data.verifiedEmail = false;
    }
    await this.userModel.updateOne({ _id: id }, data);
    const newUser = await this.userModel.findById(id);
    if (data.email && data.email !== eUser.email) {
      await this.authService.sendVerificationEmail(newUser);
      await this.authService.updateKey({
        source: 'user',
        sourceId: newUser._id,
        type: 'email'
      });
    }
    // update auth key if username or email has changed
    if (data.username && data.username !== eUser.username) {
      await this.authService.updateKey({
        source: 'user',
        sourceId: newUser._id,
        type: 'username'
      });
    }
    return newUser;
  }

  public async updateAvatar(user: UserDto, file: FileDto) {
    await this.userModel.updateOne(
      { _id: user._id },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );

    // resend user info?
    // TODO - check others config for other storage
    return file;
  }

  public async adminUpdate(id: string | ObjectId, payload: UserAuthUpdatePayload): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload };
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }

    if (data.username && data.username !== user.username) {
      const countUserUsername = await this.userModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: user._id }
      });
      const countPerformerUsername = await this.performerService.checkExistedEmailorUsername({ username: data.username });
      if (countUserUsername || countPerformerUsername) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }
    if (data.email && data.email !== user.email) {
      const countUserEmail = await this.userModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: { $ne: user._id }
      });
      const countPerformerEmail = await this.performerService.checkExistedEmailorUsername({ email: data.email });
      if (countUserEmail || countPerformerEmail) {
        throw new EmailHasBeenTakenException();
      }
      data.email = data.email.toLowerCase();
      data.verifiedEmail = false;
    }

    await this.userModel.updateOne({ _id: id }, data);
    // update auth key if username or email has changed
    const newUser = await this.userModel.findById(id);
    if (data.email && data.email !== user.email) {
      await this.authService.sendVerificationEmail(newUser);
      await this.authService.updateKey({
        source: 'user',
        sourceId: newUser._id,
        type: 'email'
      });
    }
    // update auth key if username or email has changed
    if (data.username && data.username !== user.username) {
      await this.authService.updateKey({
        source: 'user',
        sourceId: newUser._id,
        type: 'username'
      });
    }
    return newUser;
  }

  public async updateVerificationStatus(userId: string | ObjectId): Promise<any> {
    await this.userModel.updateOne(
      {
        _id: userId
      },
      { verifiedEmail: true, status: 'active' }
    );
  }

  public async updateStats(
    id: string | ObjectId,
    payload: Record<string, number>
  ) {
    return this.userModel.updateOne({ _id: id }, { $inc: payload });
  }

  public async updateCCbillPaymentInfo(userId: | ObjectId, subscriptionId: string) {
    await this.userModel.updateOne({ _id: userId }, { ccbillCardToken: subscriptionId, authorisedCard: true });
  }

  public async delete(id: string) {
    if (!StringHelper.isObjectId(id)) throw new ForbiddenException();
    const user = await this.userModel.findById(id);
    if (!user) throw new EntityNotFoundException();
    await this.userModel.deleteOne({ _id: id });
    await this.queueEventService.publish(new QueueEvent({
      channel: DELETE_USER_CHANNEL,
      eventName: EVENT.DELETED,
      data: new UserDto(user)
    }));
    return { deleted: true };
  }
}
