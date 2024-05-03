import {
  Controller,
  Injectable,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Query,
  Request,
  Inject,
  forwardRef
} from '@nestjs/common';
import { AuthGuard, LoadUser } from 'src/modules/auth/guards';
import { DataResponse, ForbiddenException } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { AuthService } from 'src/modules/auth/services';
import { UserDto } from 'src/modules/user/dtos';
import { FeedService } from '../services';
import { FeedSearchRequest } from '../payloads';

@Injectable()
@Controller('feeds/users')
export class UserFeedController {
  constructor(
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Get('')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerFeeds(
    @Query() query: FeedSearchRequest,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ): Promise<DataResponse<any>> {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = req.authUser && await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.feedService.userSearchFeeds(query, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/home-feeds')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSubscribedPerformerFeeds(
    @Query() query: FeedSearchRequest,
    @CurrentUser() user: any,
    @Request() req: any
  ): Promise<DataResponse<any>> {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = req.authUser && await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.feedService.searchSubscribedPerformerFeeds(query, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Request() req: any
  ): Promise<DataResponse<any>> {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = req.authUser && await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.feedService.findOne(id, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() req: any
  ) {
    if (!req.query.token) throw new ForbiddenException();
    const user = await this.authService.getSourceFromJWT(req.query.token);
    if (!user) {
      throw new ForbiddenException();
    }
    const valid = await this.feedService.checkAuth(req, user);
    return DataResponse.ok(valid);
  }

  @Post('/vote/:pollId')
  @Roles('user')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Param('pollId') pollId: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.feedService.votePollFeed(pollId, user);
    return DataResponse.ok(data);
  }
}
