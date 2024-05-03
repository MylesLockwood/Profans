import {
  Injectable,
  Inject,
  forwardRef,
  HttpException
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  EntityNotFoundException, ForbiddenException, QueueEventService, QueueEvent, StringHelper
} from 'src/kernel';
import { ObjectId } from 'mongodb';
import { FileService } from 'src/modules/file/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { AuthService } from 'src/modules/auth/services';
import { EVENT } from 'src/kernel/constants';
import { REACTION_TYPE, REACTION } from 'src/modules/reaction/constants';
import { OFFLINE } from 'src/modules/stream/constant';
import { REF_TYPE } from 'src/modules/file/constants';
import {
  PERFORMER_UPDATE_STATUS_CHANNEL, PERFORMER_UPDATE_ORIENTATION_CHANNEL, DELETE_PERFORMER_CHANNEL
} from 'src/modules/performer/constants';
import { EmailHasBeenTakenException } from 'src/modules/user/exceptions';
import { MailerService } from 'src/modules/mailer';
import { UserService } from 'src/modules/user/services';
import { BankingSettingService, PaymentGatewaySettingService } from 'src/modules/payment/services';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { PerformerBlockService } from 'src/modules/block/services';
import { PerformerDto } from '../dtos';
import {
  UsernameExistedException,
  EmailExistedException
} from '../exceptions';
import {
  PerformerModel,
  CommissionSettingModel
} from '../models';
import {
  PerformerCreatePayload,
  PerformerUpdatePayload,
  PerformerRegisterPayload,
  SelfUpdatePayload,
  CommissionSettingPayload
} from '../payloads';
import {
  PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER,
  PERFORMER_MODEL_PROVIDER
} from '../providers';

@Injectable()
export class PerformerService {
  constructor(
    @Inject(forwardRef(() => PaymentGatewaySettingService))
    private readonly paymentGatewaySettingService: PaymentGatewaySettingService,
    @Inject(forwardRef(() => BankingSettingService))
    private readonly bankingSettingService: BankingSettingService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => PerformerBlockService))
    private readonly performerBlockService: PerformerBlockService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    private readonly queueEventService: QueueEventService,
    private readonly mailService: MailerService,
    @Inject(PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER)
    private readonly commissionSettingModel: Model<CommissionSettingModel>
  ) { }

  public async findById(
    id: string | ObjectId
  ): Promise<PerformerModel> {
    const model = await this.performerModel.findById(id);
    if (!model) return null;
    return model;
  }

  public async findOne(query) {
    const data = await this.performerModel.findOne(query).lean();
    return data;
  }

  public async checkExistedEmailorUsername(payload) {
    const data = payload.username ? await this.performerModel.countDocuments({ username: payload.username.trim() })
      : await this.performerModel.countDocuments({ email: payload.email.toLowerCase() });
    return data;
  }

  public async findByUsername(
    username: string,
    countryCode?: string,
    currentUser?: UserDto
  ): Promise<PerformerDto> {
    const query = isObjectId(username) ? { _id: username } : { username: username.trim() };
    const model = await this.performerModel.findOne(query);
    if (!model) throw new EntityNotFoundException('Model is not found');
    let isBlocked = false;
    if (countryCode && `${currentUser?._id}` !== `${model._id}`) {
      isBlocked = await this.performerBlockService.checkBlockedCountryByIp(model._id, countryCode);
      if (isBlocked) {
        throw new HttpException('Your country has been blocked by this model', 403);
      }
    }
    let isBookMarked = null;
    let isSubscribed = false;
    if (currentUser) {
      // const  isBlockedByPerformer = `${currentUser?._id}` !== `${model._id}` && await this.performerBlockService.checkBlockedByPerformer(
      //   model._id,
      //   currentUser._id
      // );
      // if (isBlockedByPerformer) throw new HttpException('You has been blocked by this model', 403);
      isSubscribed = await this.subscriptionService.checkSubscribed(model._id, currentUser._id);
      isBookMarked = await this.reactionService.findOneQuery({
        objectType: REACTION_TYPE.PERFORMER, objectId: model._id, createdBy: currentUser._id, action: REACTION.BOOK_MARK
      });
    }
    const dto = new PerformerDto(model);
    dto.isSubscribed = !!isSubscribed;
    dto.isBookMarked = !!isBookMarked;
    if (model.avatarId) {
      const avatar = await this.fileService.findById(model.avatarId);
      dto.avatarPath = avatar ? avatar.path : null;
    }
    if (model.welcomeVideoId) {
      const welcomeVideo = await this.fileService.findById(
        model.welcomeVideoId
      );
      dto.welcomeVideoPath = welcomeVideo ? welcomeVideo.getUrl() : null;
    }
    await this.viewProfile(model._id);
    return dto;
  }

  public async findByEmail(email: string): Promise<PerformerDto> {
    if (!email) {
      return null;
    }
    const model = await this.performerModel.findOne({
      email: email.toLowerCase()
    });
    if (!model) return null;
    return new PerformerDto(model);
  }

  public async findByIds(ids: (string | ObjectId)[]) {
    return this.performerModel
      .find({
        _id: {
          $in: ids
        }
      });
  }

  public async getDetails(id: string | ObjectId, jwtToken: string): Promise<PerformerDto> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    const [
      avatar,
      documentVerification,
      idVerification,
      cover,
      welcomeVideo
    ] = await Promise.all([
      performer.avatarId ? this.fileService.findById(performer.avatarId) : null,
      performer.documentVerificationId
        ? this.fileService.findById(performer.documentVerificationId)
        : null,
      performer.idVerificationId
        ? this.fileService.findById(performer.idVerificationId)
        : null,
      performer.coverId ? this.fileService.findById(performer.coverId) : null,
      performer.welcomeVideoId
        ? this.fileService.findById(performer.welcomeVideoId)
        : null
    ]);

    // TODO - update kernel for file dto
    const dto = new PerformerDto(performer);
    dto.avatar = avatar ? FileDto.getPublicUrl(avatar.path) : null; // TODO - get default avatar
    dto.cover = cover ? FileDto.getPublicUrl(cover.path) : null;
    dto.welcomeVideoPath = welcomeVideo
      ? FileDto.getPublicUrl(welcomeVideo.path)
      : null;
    dto.idVerification = idVerification
      ? {
        _id: idVerification._id,
        url: jwtToken ? `${FileDto.getPublicUrl(idVerification.path)}?documentId=${idVerification._id}&token=${jwtToken}` : FileDto.getPublicUrl(idVerification.path),
        mimeType: idVerification.mimeType
      }
      : null;
    dto.documentVerification = documentVerification
      ? {
        _id: documentVerification._id,
        url: jwtToken ? `${FileDto.getPublicUrl(documentVerification.path)}?documentId=${documentVerification._id}&token=${jwtToken}` : FileDto.getPublicUrl(documentVerification.path),
        mimeType: documentVerification.mimeType
      }
      : null;

    dto.ccbillSetting = await this.paymentGatewaySettingService.getPaymentSetting(id, 'ccbill');

    dto.paypalSetting = await this.paymentGatewaySettingService.getPaymentSetting(id, 'paypal');

    dto.bankingSetting = await this.bankingSettingService.getBankingSetting(id);

    dto.commissionSetting = await this.commissionSettingModel.findOne({
      performerId: id
    });
    return dto;
  }

  public async delete(id: string) {
    if (!StringHelper.isObjectId(id)) throw new ForbiddenException();
    const performer = await this.performerModel.findById(id);
    if (!performer) throw new EntityNotFoundException();
    await this.performerModel.deleteOne({ _id: id });
    await this.queueEventService.publish(new QueueEvent({
      channel: DELETE_PERFORMER_CHANNEL,
      eventName: EVENT.DELETED,
      data: new PerformerDto(performer).toResponse()
    }));
    return { deleted: true };
  }

  public async create(
    payload: PerformerCreatePayload,
    user?: UserDto
  ): Promise<PerformerDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const countPerformerUsername = await this.performerModel.countDocuments({
      username: payload.username.trim()
    });
    const countUserUsername = await this.userService.checkExistedEmailorUsername({ username: payload.username });
    if (countPerformerUsername || countUserUsername) {
      throw new UsernameExistedException();
    }

    const countPerformerEmail = await this.performerModel.countDocuments({
      email: payload.email.toLowerCase()
    });
    const countUserEmail = await this.userService.checkExistedEmailorUsername({ email: payload.email });
    if (countPerformerEmail || countUserEmail) {
      throw new EmailExistedException();
    }

    if (payload.avatarId) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }

    if (payload.coverId) {
      const cover = await this.fileService.findById(payload.coverId);
      if (!cover) {
        throw new EntityNotFoundException('Cover not found!');
      }
      // TODO - check for other storaged
      data.coverPath = cover.path;
    }

    // TODO - check for category Id, studio
    if (user) {
      data.createdBy = user._id;
    }
    data.username = data.username.trim();
    data.email = data.email.toLowerCase();
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }
    if (!data.name) {
      data.name = data.firstName && data.lastName ? [data.firstName, data.lastName].join(' ') : 'No_display_name';
    }
    const performer = await this.performerModel.create(data);

    await Promise.all([
      payload.idVerificationId
      && this.fileService.addRef(payload.idVerificationId, {
        itemId: performer._id as any,
        itemType: REF_TYPE.PERFORMER
      }),
      payload.documentVerificationId
      && this.fileService.addRef(payload.documentVerificationId, {
        itemId: performer._id as any,
        itemType: REF_TYPE.PERFORMER
      }),
      payload.avatarId
        && this.fileService.addRef(payload.avatarId, {
          itemId: performer._id as any,
          itemType: REF_TYPE.PERFORMER
        })
    ]);

    // TODO - fire event?
    return new PerformerDto(performer);
  }

  public async register(
    payload: PerformerRegisterPayload
  ): Promise<PerformerDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const countPerformerUsername = await this.performerModel.countDocuments({
      username: payload.username.trim()
    });
    const countUserUsername = await this.userService.checkExistedEmailorUsername({ username: payload.username });
    if (countPerformerUsername || countUserUsername) {
      throw new UsernameExistedException();
    }

    const countPerformerEmail = await this.performerModel.countDocuments({
      email: payload.email.toLowerCase()
    });
    const countUserEmail = await this.userService.checkExistedEmailorUsername({ email: payload.email });
    if (countPerformerEmail || countUserEmail) {
      throw new EmailExistedException();
    }

    if (payload.avatarId) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }
    data.username = data.username.trim();
    data.email = data.email.toLowerCase();
    if (!data.name) {
      data.name = data.firstName && data.lastName ? [data.firstName, data.lastName].join(' ') : 'No_display_name';
    }
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }
    const performer = await this.performerModel.create(data);

    await Promise.all([
      payload.idVerificationId
      && this.fileService.addRef(payload.idVerificationId, {
        itemId: performer._id as any,
        itemType: REF_TYPE.PERFORMER
      }),
      payload.documentVerificationId
      && this.fileService.addRef(payload.documentVerificationId, {
        itemId: performer._id as any,
        itemType: REF_TYPE.PERFORMER
      }),
      payload.avatarId && this.fileService.addRef(payload.avatarId, {
        itemId: performer._id as any,
        itemType: REF_TYPE.PERFORMER
      })
    ]);
    const adminEmail = await SettingService.getValueByKey(SETTING_KEYS.ADMIN_EMAIL);
    adminEmail && await this.mailService.send({
      subject: 'New content creator sign up',
      to: adminEmail,
      data: performer,
      template: 'new-performer-notify-admin.html'
    });

    // TODO - fire event?
    return new PerformerDto(performer);
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: PerformerUpdatePayload
  ): Promise<any> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload } as any;
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }

    if (data.email && data.email.toLowerCase() !== performer.email) {
      const emailCheck = await this.performerModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: { $ne: performer._id }
      });
      const countUserEmail = await this.userService.checkExistedEmailorUsername({ email: data.email });
      if (emailCheck || countUserEmail) {
        throw new EmailExistedException();
      }
      data.email = data.email.toLowerCase();
    }

    if (data.username && data.username.trim() !== performer.username) {
      const usernameCheck = await this.performerModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: performer._id }
      });
      const countUserUsername = await this.userService.checkExistedEmailorUsername({ username: data.username });
      if (usernameCheck || countUserUsername) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }

    if ((payload.avatarId && !performer.avatarId) || (performer.avatarId && payload.avatarId && payload.avatarId !== performer.avatarId.toString())) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }

    if ((payload.coverId && !performer.coverId) || (performer.coverId && payload.coverId && payload.coverId !== performer.coverId.toString())) {
      const cover = await this.fileService.findById(payload.coverId);
      if (!cover) {
        throw new EntityNotFoundException('Cover not found!');
      }
      // TODO - check for other storaged
      data.coverPath = cover.path;
    }
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }
    await this.performerModel.updateOne({ _id: id }, data);
    const newPerformer = await this.performerModel.findById(performer._id);
    const oldStatus = performer.status;
    const oldOrientation = performer.sexualOrientation;
    // fire event that updated performer status
    if (data.status !== performer.status) {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_UPDATE_STATUS_CHANNEL,
          eventName: EVENT.UPDATED,
          data: {
            ...new PerformerDto(newPerformer),
            oldStatus
          }
        })
      );
    }
    // fire event that updated performer orientation
    if (data.sexualOrientation !== performer.sexualOrientation) {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_UPDATE_ORIENTATION_CHANNEL,
          eventName: EVENT.UPDATED,
          data: {
            ...new PerformerDto(newPerformer),
            oldOrientation
          }
        })
      );
    }
    // update auth key if email has changed
    if (data.email && data.email.toLowerCase() !== performer.email) {
      await this.authService.updateKey({
        source: 'performer',
        sourceId: performer._id,
        type: 'email'
      });
    }
    // update auth key if username has changed
    if ((data.username && data.username.trim() !== performer.username)) {
      await this.authService.updateKey({
        source: 'performer',
        sourceId: performer._id,
        type: 'username'
      });
    }
    return newPerformer;
  }

  public async selfUpdate(
    id: string | ObjectId,
    payload: SelfUpdatePayload,
    welcomeVideo?: FileDto
  ): Promise<any> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    if (welcomeVideo && !welcomeVideo.mimeType.toLowerCase().includes('video')) {
      await this.fileService.remove(welcomeVideo._id);
    }
    const data = { ...payload } as any;
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }
    if (data.email && data.email.toLowerCase() !== performer.email) {
      const emailCheck = await this.performerModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: { $ne: performer._id }
      });
      const countUserEmail = await this.userService.checkExistedEmailorUsername({ email: data.email });
      if (emailCheck || countUserEmail) {
        throw new EmailHasBeenTakenException();
      }
      data.email = data.email.toLowerCase();
    }

    if (data.username && data.username.trim() !== performer.username) {
      const usernameCheck = await this.performerModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: performer._id }
      });
      const countUserUsername = await this.userService.checkExistedEmailorUsername({ username: data.username });
      if (usernameCheck || countUserUsername) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }
    await this.performerModel.updateOne({ _id: id }, data);
    const newPerformer = await this.performerModel.findById(id);
    const oldOrientation = performer.sexualOrientation;
    // fire event that updated performer orientation
    if (data.sexualOrientation !== performer.sexualOrientation) {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_UPDATE_ORIENTATION_CHANNEL,
          eventName: EVENT.UPDATED,
          data: {
            ...new PerformerDto(newPerformer),
            oldOrientation
          }
        })
      );
    }
    // update auth key if email has changed
    if (data.email && data.email.toLowerCase() !== performer.email) {
      await this.authService.sendVerificationEmail(newPerformer);
      await this.authService.updateKey({
        source: 'performer',
        sourceId: newPerformer._id,
        type: 'email'
      });
    }
    // update auth key if username has changed
    if (data.username && data.username.trim() !== performer.username) {
      await this.authService.updateKey({
        source: 'performer',
        sourceId: newPerformer._id,
        type: 'username'
      });
    }
    return newPerformer;
  }

  public async userSwitchAccount(data): Promise<PerformerModel> {
    return this.performerModel.create(data);
  }

  public async updateAvatar(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );
    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    // resend user info?
    // TODO - check others config for other storage
    return file;
  }

  public async updateCover(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        coverId: file._id,
        coverPath: file.path
      }
    );
    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    return file;
  }

  public async updateWelcomeVideo(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        welcomeVideoId: file._id,
        welcomeVideoPath: file.path
      }
    );

    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    return file;
  }

  public async checkSubscribed(performerId: string | ObjectId, user: UserDto) {
    const count = performerId && user ? await this.subscriptionService.checkSubscribed(
      performerId,
      user._id
    ) : 0;
    return { subscribed: count > 0 };
  }

  public async viewProfile(_id: ObjectId) {
    return this.performerModel.updateOne(
      { _id },
      {
        $inc: { 'stats.views': 1 }
      }
    );
  }

  public async updateLastStreamingTime(
    id: string | ObjectId,
    streamTime: number
  ) {
    return this.performerModel.updateOne(
      { _id: id },
      {
        $set: { lastStreamingTime: new Date(), live: false, streamingStatus: OFFLINE },
        $inc: { 'stats.totalStreamTime': streamTime }
      }
    );
  }

  public async updateStats(
    id: string | ObjectId,
    payload: Record<string, number>
  ) {
    return this.performerModel.updateOne({ _id: id }, { $inc: payload });
  }

  public async goLive(id: string | ObjectId) {
    return this.performerModel.updateOne({ _id: id }, { $set: { live: true } });
  }

  public async setStreamingStatus(id: string | ObjectId, streamingStatus: string) {
    return this.performerModel.updateOne({ _id: id }, { $set: { streamingStatus } });
  }

  public async updateSubscriptionStat(performerId: string | ObjectId, num = 1) {
    const performer = await this.performerModel.findById(performerId);
    if (!performer) return false;
    const minimumVerificationNumber = await this.settingService.getKeyValue(SETTING_KEYS.PERFORMER_VERIFY_NUMBER) || 5;
    const verifiedAccount = num === 1 ? performer.stats.subscribers >= (minimumVerificationNumber - 1) : (performer.stats.subscribers - 1) < minimumVerificationNumber;
    return this.performerModel.updateOne(
      { _id: performerId },
      {
        $inc: { 'stats.subscribers': num },
        verifiedAccount
      }
    );
  }

  public async updateLikeStat(performerId: string | ObjectId, num = 1) {
    return this.performerModel.updateOne(
      { _id: performerId },
      {
        $inc: { 'stats.likes': num }
      }
    );
  }

  public async updateCommissionSetting(
    performerId: string,
    payload: CommissionSettingPayload
  ) {
    let item = await this.commissionSettingModel.findOne({
      performerId
    });
    if (!item) {
      // eslint-disable-next-line new-cap
      item = new this.commissionSettingModel();
    }
    item.performerId = performerId as any;
    item.monthlySubscriptionCommission = payload.monthlySubscriptionCommission;
    item.yearlySubscriptionCommission = payload.yearlySubscriptionCommission;
    item.videoSaleCommission = payload.videoSaleCommission;
    item.productSaleCommission = payload.productSaleCommission;
    item.tipCommission = payload.tipCommission;
    item.feedSaleCommission = payload.feedSaleCommission;
    item.referralCommission = payload.referralCommission;
    return item.save();
  }

  public async updateVerificationStatus(
    performerId: string | ObjectId
  ): Promise<any> {
    await this.performerModel.updateOne(
      {
        _id: performerId
      },
      { verifiedEmail: true, status: 'inactive' }
    );
  }

  public async getCommissions(performerId: string | ObjectId) {
    return this.commissionSettingModel.findOne({ performerId });
  }

  public async checkAuthDocument(req: any, user: UserDto) {
    const { query } = req;
    if (!query.documentId) {
      throw new ForbiddenException();
    }
    if (user.roles && user.roles.indexOf('admin') > -1) {
      return true;
    }
    // check type video
    const file = await this.fileService.findById(query.documentId);
    if (!file || !file.refItems || (file.refItems[0] && file.refItems[0].itemType !== REF_TYPE.PERFORMER)) return false;
    if (file.refItems && file.refItems[0].itemId && user._id.toString() === file.refItems[0].itemId.toString()) {
      return true;
    }
    throw new ForbiddenException();
  }
}
