import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
  Post,
  Param,
  Query,
  Put
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { ConversationDto } from '../dtos';
import { ConversationService } from '../services/conversation.service';
import { ConversationCreatePayload, ConversationSearchPayload, ConversationUpdatePayload } from '../payloads';

@Injectable()
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getListOfCurrentUser(
    @Query() query: ConversationSearchPayload,
    @Request() req: any
  ): Promise<DataResponse<ConversationDto[]>> {
    const items = await this.conversationService.getList(query, {
      source: req.authUser.source,
      sourceId: req.authUser.sourceId
    });
    return DataResponse.ok(items);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getDetails(
    @Param('id') conversationId: string
  ): Promise<DataResponse<any>> {
    const data = await this.conversationService.findById(conversationId);
    return DataResponse.ok(new ConversationDto(data));
  }

  @Get('/stream/public/:performerId')
  @HttpCode(HttpStatus.OK)
  async findConversation(
    @Param('performerId') performerId: string
  ): Promise<DataResponse<any>> {
    const data = await this.conversationService.findPerformerPublicConversation(performerId);
    return DataResponse.ok(new ConversationDto(data));
  }

  @Get('/stream/:streamId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getByStream(
    @Param('streamId') streamId: string
  ): Promise<DataResponse<any>> {
    const data = await this.conversationService.getPrivateConversationByStreamId(streamId);
    return DataResponse.ok(new ConversationDto(data));
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async create(
    @Body() payload: ConversationCreatePayload,
    @CurrentUser() user: any
  ) {
    if (payload.sourceId === user._id.toString()) {
      throw new ForbiddenException();
    }

    const sender = {
      source: user.isPerformer ? 'performer' : 'user',
      sourceId: user._id
    };
    const receiver = {
      source: payload.source,
      sourceId: toObjectId(payload.sourceId)
    };
    const conversation = await this.conversationService.createPrivateConversation(
      sender,
      receiver
    );

    return DataResponse.ok(conversation);
  }

  @Put('/:id/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async updateConversationName(
    @Param('id') id: string,
    @Body() payload: ConversationUpdatePayload,
    @CurrentUser() user: UserDto
  ) {
    const conversation = await this.conversationService.updateConversationName(id, user, payload);

    return DataResponse.ok(conversation);
  }
}
