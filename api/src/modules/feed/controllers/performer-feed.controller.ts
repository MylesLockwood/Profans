import {
  Controller,
  Injectable,
  UseGuards,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Put,
  Param,
  Delete,
  Get,
  Query,
  Request,
  forwardRef,
  Inject
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { AuthService } from 'src/modules/auth/services';
import {
  FeedCreatePayload, FeedSearchRequest,
  PollCreatePayload
} from '../payloads';
import { FeedDto } from '../dtos';
import { FeedService } from '../services';
import { MissingFieldsException } from '../exceptions';

@Injectable()
@Controller('feeds/performers')
export class PerformerFeedController {
  constructor(
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Post('/')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: FeedCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    if (user.roles && user.roles.includes('admin') && !payload.fromSourceId) {
      throw new MissingFieldsException();
    }
    const data = await this.feedService.create(payload, user);
    return DataResponse.ok(data);
  }

  @Get('/')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMyFeeds(
    @Query() query: FeedSearchRequest,
    @CurrentUser() performer: UserDto,
    @Request() req: any
  ): Promise<DataResponse<PageableData<any>>> {
    const auth = { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.feedService.search(query, performer, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerFeed(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Request() req: any
  ): Promise<DataResponse<FeedDto>> {
    const auth = { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.feedService.findOne(id, user, jwToken);
    return DataResponse.ok(data);
  }

  @Put('/:id')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateFeed(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Body() payload: FeedCreatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.feedService.updateFeed(id, user, payload);
    return DataResponse.ok(data);
  }

  @Delete('/:id')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePerformerFeed(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.feedService.deleteFeed(id, user);
    return DataResponse.ok(data);
  }

  @Post('/polls')
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPollFeed(
    @Body() payload: PollCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.feedService.createPoll(payload, user);
    return DataResponse.ok(data);
  }
}
