/* eslint-disable no-param-reassign */
import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
  Post,
  Body,
  Delete,
  Request,
  forwardRef,
  Inject
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { AuthService } from 'src/modules/auth/services';
import { ReactionService } from '../services/reaction.service';
import { ReactionCreatePayload, ReactionSearchRequestPayload } from '../payloads';
import { ReactionDto } from '../dtos/reaction.dto';
import { UserDto } from '../../user/dtos';
import { REACTION } from '../constants';

@Injectable()
@Controller('reactions')
export class ReactionController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly reactionService: ReactionService
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() user: UserDto,
    @Body() payload: ReactionCreatePayload
  ): Promise<DataResponse<ReactionDto>> {
    const data = await this.reactionService.create(payload, user);
    return DataResponse.ok(data);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async remove(
    @CurrentUser() user: UserDto,
    @Body() payload: ReactionCreatePayload
  ): Promise<DataResponse<boolean>> {
    const data = await this.reactionService.remove(payload, user);
    return DataResponse.ok(data);
  }

  @Get('/feeds/bookmark')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookmarkFeeds(
    @Query() query: ReactionSearchRequestPayload,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ): Promise<DataResponse<PageableData<ReactionDto>>> {
    query.action = REACTION.BOOK_MARK;
    query.createdBy = user._id;
    const auth = { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = await this.authService.generateJWT(auth, { expiresIn: 4 * 60 * 60 });
    const data = await this.reactionService.getListFeeds(query, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/products/bookmark')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookmarkProducts(
    @Query() query: ReactionSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<ReactionDto>>> {
    query.action = REACTION.BOOK_MARK;
    query.createdBy = user._id;
    const data = await this.reactionService.getListProduct(query);
    return DataResponse.ok(data);
  }

  @Get('/performers/bookmark')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookmarkPerformers(
    @Query() req: ReactionSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<ReactionDto>>> {
    req.action = REACTION.BOOK_MARK;
    req.createdBy = user._id;
    const data = await this.reactionService.getListPerformer(req);
    return DataResponse.ok(data);
  }
}
