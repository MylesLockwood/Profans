import {
  Injectable, Inject, forwardRef, HttpException
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { SettingService } from 'src/modules/settings';
import {
  StringHelper, EntityNotFoundException, QueueEventService, QueueEvent
} from 'src/kernel';
import { MailerService } from 'src/modules/mailer';
import { ConfigService } from 'nestjs-config';
import {
  STATUS_ACTIVE, ROLE_USER, GENDER_MALE, DELETE_USER_CHANNEL
} from 'src/modules/user/constants';
import { resolve } from 'url';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { EVENT, STATUS } from 'src/kernel/constants';
import { AuthErrorException } from '../exceptions';
import { AUTH_MODEL_PROVIDER, FORGOT_MODEL_PROVIDER, VERIFICATION_MODEL_PROVIDER } from '../providers/auth.provider';
import { AuthModel, ForgotModel, VerificationModel } from '../models';
import { AuthCreateDto, AuthUpdateDto } from '../dtos';
import { AuthGooglePayload } from '../payloads';

const { OAuth2Client } = require('google-auth-library');
const oauth = require('oauth');

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(AUTH_MODEL_PROVIDER)
    private readonly authModel: Model<AuthModel>,
    @Inject(VERIFICATION_MODEL_PROVIDER)
    private readonly verificationModel: Model<VerificationModel>,
    @Inject(FORGOT_MODEL_PROVIDER)
    private readonly forgotModel: Model<ForgotModel>,
    private readonly mailService: MailerService,
    private readonly config: ConfigService,
    private readonly queueEventService: QueueEventService
  ) { }

  /**
   * generate password salt
   * @param byteSize integer
   */
  public generateSalt(byteSize = 16): string {
    return crypto.randomBytes(byteSize).toString('base64');
  }

  public encryptPassword(pw: string, salt: string): string {
    const defaultIterations = 10000;
    const defaultKeyLength = 64;

    return crypto.pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1').toString('base64');
  }

  public async findOne(query: any) {
    const data = await this.authModel.findOne(query);
    return data;
  }

  public async find(query: any) {
    const data = await this.authModel.find(query);
    return data;
  }

  public async create(data: AuthCreateDto): Promise<AuthModel> {
    const salt = this.generateSalt();
    let newVal = data.value;
    if (['email', 'username'].includes(data.type) && newVal) {
      newVal = this.encryptPassword(newVal, salt);
    }

    // avoid admin update
    // TODO - should listen via user event?
    let auth = await this.authModel.findOne({
      type: data.type,
      source: data.source,
      sourceId: data.sourceId
    });
    if (!auth) {
      // eslint-disable-next-line new-cap
      auth = new this.authModel({
        type: data.type,
        source: data.source,
        sourceId: data.sourceId
      });
    }

    auth.salt = salt;
    auth.value = newVal;
    auth.key = data.key;
    await auth.save();
    return auth;
  }

  public async update(data: AuthUpdateDto) {
    const user = data.source === 'user'
      ? await this.userService.findById(data.sourceId)
      : await this.performerService.findById(data.sourceId);
    if (!user) {
      throw new EntityNotFoundException();
    }
    await Promise.all([
      user.email && this.create({
        source: data.source,
        sourceId: data.sourceId,
        type: 'email',
        key: user.email,
        value: data.value
      }),
      user.username && this.create({
        source: data.source,
        sourceId: user._id,
        type: 'username',
        key: user.username,
        value: data.value
      })
    ]);
  }

  public async updateKey(data: AuthUpdateDto) {
    const auths = await this.authModel.find({
      source: data.source,
      sourceId: data.sourceId
    });

    const user = data.source === 'user'
      ? await this.userService.findById(data.sourceId)
      : await this.performerService.findById(data.sourceId);
    if (!user) return;

    await Promise.all(
      auths.map((auth) => {
        // eslint-disable-next-line no-param-reassign
        auth.key = auth.type === 'email' ? user.email : user.username;
        return auth.save();
      })
    );
  }

  public async findBySource(options: {
    source?: string;
    sourceId?: ObjectId;
    type?: string;
    key?: string;
  }): Promise<AuthModel | null> {
    return this.authModel.findOne(options);
  }

  public verifyPassword(pw: string, auth: AuthModel): boolean {
    if (!pw || !auth || !auth.salt) {
      return false;
    }
    return this.encryptPassword(pw, auth.salt) === auth.value;
  }

  public generateJWT(auth: any, options: any = {}): string {
    const newOptions = {
      // 30d, in miliseconds
      expiresIn: 60 * 60 * 24 * 7,
      ...(options || {})
    };
    return jwt.sign(
      {
        authId: auth._id,
        source: auth.source,
        sourceId: auth.sourceId
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: newOptions.expiresIn
      }
    );
  }

  public verifyJWT(token: string) {
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (e) {
      return false;
    }
  }

  public async getSourceFromJWT(jwtToken: string): Promise<any> {
    // TODO - check and move to user service?
    const decodded = this.verifyJWT(jwtToken);
    if (!decodded) {
      throw new AuthErrorException();
    }

    // TODO - detect source and get data?
    // TODO - should cache here?
    if (decodded.source === 'user') {
      const user = await this.userService.findById(decodded.sourceId);

      // TODO - check activated status here
      return new UserDto(user).toResponse(true);
    }
    if (decodded.source === 'performer') {
      const user = await this.performerService.findById(decodded.sourceId);
      return new PerformerDto(user).toPublicDetailsResponse();
    }

    return null;
  }

  public async forgot(
    auth: AuthModel,
    source: {
      _id: ObjectId;
      email: string;
    }
  ) {
    const token = StringHelper.randomString(14);
    await this.forgotModel.create({
      token,
      source: auth.source,
      sourceId: source._id,
      authId: auth._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const forgotLink = resolve(this.config.get('app.baseUrl'), `auth/password-change?token=${token}`);

    await this.mailService.send({
      subject: 'Recover password',
      to: source.email,
      data: {
        forgotLink
      },
      template: 'forgot.html'
    });
    return true;
  }

  public async getForgot(token: string): Promise<ForgotModel> {
    return this.forgotModel.findOne({ token });
  }

  public async loginTwitter() {
    const twitterClientId = await SettingService.getValueByKey(SETTING_KEYS.TWITTER_CLIENT_ID);
    const twitterClientSecret = await SettingService.getValueByKey(SETTING_KEYS.TWITTER_CLIENT_SECRET);
    const _twitterConsumerKey = twitterClientId;
    const _twitterConsumerSecret = twitterClientSecret;
    const _twitterCallbackUrl = process.env.USER_URL;
    const consumer = new oauth.OAuth(
      'https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      _twitterConsumerKey,
      _twitterConsumerSecret,
      '1.0A',
      _twitterCallbackUrl,
      'HMAC-SHA1'
    );
    return new Promise((resolver, reject) => {
      try {
        consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
          if (error) {
            return reject(new AuthErrorException());
          }
          return resolver({
            url: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
            oauthToken,
            oauthTokenSecret
          });
        });
      } catch (e) {
        reject(new AuthErrorException());
      }
    });
  }

  public async twitterLoginCallback(req: any) {
    const twitterClientId = await SettingService.getValueByKey(SETTING_KEYS.TWITTER_CLIENT_ID);
    const twitterClientSecret = await SettingService.getValueByKey(SETTING_KEYS.TWITTER_CLIENT_SECRET);
    const _twitterConsumerKey = twitterClientId;
    const _twitterConsumerSecret = twitterClientSecret;
    const _twitterCallbackUrl = process.env.USER_URL;
    const consumer = new oauth.OAuth(
      'https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      _twitterConsumerKey,
      _twitterConsumerSecret,
      '1.0A',
      _twitterCallbackUrl,
      'HMAC-SHA1'
    );
    const _this = this;
    return new Promise((resolver, reject) => {
      try {
        consumer.getOAuthAccessToken(
          req.oauthToken,
          req.oauthTokenSecret,
          req.oauth_verifier,
          async (error, oauthAccessToken, oauthAccessTokenSecret, profile) => {
            if (error) {
              return reject(new HttpException(error.message ? error.message : 'Twitter Authentication Error', 422));
            }
            if (!profile || !profile.user_id) {
              return reject(new EntityNotFoundException());
            }
            const [user, performer] = await Promise.all([
              _this.userService.findOne({
                'twitterProfile.user_id': profile.user_id
              }),
              _this.performerService.findOne({
                'twitterProfile.user_id': profile.user_id
              })
            ]);
            if (user) {
              let authUser = await _this.findBySource({
                source: 'user',
                sourceId: user._id
              });
              if (!authUser) {
                authUser = await _this.create(
                  new AuthCreateDto({
                    type: 'username',
                    source: 'user',
                    sourceId: user._id,
                    key: profile.screen_name
                  })
                );
              }
              const token = _this.generateJWT(authUser);
              return resolver({ token });
            }
            if (performer) {
              let authUser = await _this.findBySource({
                source: 'performer',
                sourceId: performer._id
              });
              if (!authUser) {
                authUser = await _this.create(
                  new AuthCreateDto({
                    type: 'username',
                    source: 'performer',
                    sourceId: performer._id,
                    key: profile.screen_name
                  })
                );
              }
              const token = _this.generateJWT(authUser);
              return resolver({ token });
            }
            const newUser = await _this.userService.socialCreate({
              username: profile.screen_name,
              status: STATUS_ACTIVE,
              roles: [ROLE_USER],
              gender: GENDER_MALE,
              twitterConnected: true,
              twitterProfile: profile
            });
            const newAuth = await _this.create(
              new AuthCreateDto({
                source: 'user',
                sourceId: newUser._id,
                type: 'username',
                key: profile.screen_name
              })
            );
            const token = await _this.generateJWT(newAuth);
            return resolver({ token });
          }
        );
      } catch (e) {
        reject(new EntityNotFoundException());
      }
    });
  }

  public async verifyLoginGoogle(payload: AuthGooglePayload) {
    const googleClientId = await SettingService.getValueByKey(SETTING_KEYS.GOOGLE_CLIENT_ID);
    const _googleClientId = googleClientId;
    const client = new OAuth2Client(_googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: payload.tokenId,
      audience: _googleClientId
    });
    const profile = ticket.payload;
    if (!profile.email || !profile.email_verified) {
      throw new AuthErrorException();
    }
    const [user, performer] = await Promise.all([
      this.userService.findOne({
        email: profile.email
      }),
      this.performerService.findOne({
        email: profile.email
      })
    ]);
    if (user) {
      let authUser = await this.findBySource({
        source: 'user',
        sourceId: user._id
      });
      if (!authUser) {
        authUser = await this.create(
          new AuthCreateDto({
            type: 'email',
            source: 'user',
            sourceId: user._id,
            key: profile.email.toLowerCase()
          })
        );
      }
      const token = this.generateJWT(authUser);
      return { token };
    }
    if (performer) {
      let authUser = await this.findBySource({
        source: 'performer',
        sourceId: performer._id
      });
      if (!authUser) {
        authUser = await this.create(
          new AuthCreateDto({
            type: 'email',
            source: 'performer',
            sourceId: performer._id,
            key: profile.email
          })
        );
      }
      const token = this.generateJWT(authUser);
      return { token };
    }
    const newUser = await this.userService.socialCreate({
      email: profile.email.toLowerCase(),
      firstName: profile.given_name,
      lastName: profile.family_name,
      name: profile.name,
      avatarPath: profile.picture || null,
      verifiedEmail: true,
      status: STATUS_ACTIVE,
      roles: [ROLE_USER],
      gender: GENDER_MALE,
      googleConnected: true,
      googleProfile: profile
    });
    const newAuth = await this.create(
      new AuthCreateDto({
        source: 'user',
        sourceId: newUser._id,
        type: 'email',
        key: profile.email
      })
    );
    const token = this.generateJWT(newAuth);
    return { token };
  }

  async sendVerificationEmail(source: any): Promise<void> {
    const verifications = await this.verificationModel.find({
      sourceId: source._id,
      value: source.email.toLowerCase()
    });
    const token = StringHelper.randomString(15);
    if (!verifications.length) {
      await this.verificationModel.create({
        sourceId: source._id,
        sourceType: 'user',
        value: source.email,
        token
      });
      await this.verificationModel.create({
        sourceId: source._id,
        sourceType: 'performer',
        value: source.email,
        token
      });
    }
    if (verifications.length) {
      await Promise.all(verifications.map((verification) => {
        // eslint-disable-next-line no-param-reassign
        verification.token = token;
        return verification.save();
      }));
    }
    const verificationLink = resolve(
      this.config.get('app.baseUrl'),
      `auth/email-verification?token=${token}`
    );
    const siteName = await SettingService.getValueByKey(SETTING_KEYS.SITE_NAME) || process.env.DOMAIN;
    await this.mailService.send({
      to: source.email,
      subject: 'Verify your email address',
      data: {
        source,
        verificationLink,
        siteName
      },
      template: 'email-verification'
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const verifications = await this.verificationModel.find({
      token
    });
    if (!verifications || !verifications.length) {
      throw new EntityNotFoundException();
    }
    await Promise.all(verifications.map((verification) => {
      if (verification.sourceType === 'user') {
        this.userService.updateVerificationStatus(verification.sourceId);
      }
      if (verification.sourceType === 'performer') {
        this.performerService.updateVerificationStatus(verification.sourceId);
      }
      // eslint-disable-next-line no-param-reassign
      verification.verified = true;
      return verification.save();
    }));
  }

  async switchUserAccount(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new EntityNotFoundException();
    }
    if (await SettingService.getValueByKey(SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION) && !user.verifiedEmail) {
      throw new HttpException('Please verify your email address!', 403);
    }
    const userAuths = await this.authModel.find({
      sourceId: user._id
    });
    if (!userAuths || !userAuths.length) {
      throw new EntityNotFoundException();
    }
    const newPerformer = await this.performerService.userSwitchAccount({
      firstName: user?.firstName,
      lastName: user?.lastName,
      name: user?.name,
      username: user?.username,
      email: user?.email,
      verifiedEmail: user?.verifiedEmail || false,
      phone: user?.phone,
      avatarId: user?.avatarId,
      avatarPath: user?.avatarPath,
      status: STATUS.ACTIVE,
      gender: user?.gender,
      country: user?.country,
      twitterProfile: user?.twitterProfile,
      googleProfile: user?.googleProfile,
      googleConnected: user?.googleConnected,
      twitterConnected: user?.twitterConnected,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await user.remove();
    await this.queueEventService.publish(new QueueEvent({
      channel: DELETE_USER_CHANNEL,
      eventName: EVENT.DELETED,
      data: new UserDto(user)
    }));
    await Promise.all(userAuths.map(async (auth) => {
      // eslint-disable-next-line no-param-reassign
      auth.source = 'performer';
      // eslint-disable-next-line no-param-reassign
      auth.sourceId = newPerformer._id;
      return auth.save();
    }));
    return { token: this.generateJWT(userAuths[0]) };
  }
}
