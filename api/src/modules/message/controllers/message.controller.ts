import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  ForbiddenException,
  Get,
  Query,
  Param,
  Delete,
  UseInterceptors
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { MultiFileUploadInterceptor, FilesUploaded } from 'src/modules/file';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { MessageService, NotificationMessageService } from '../services';
import {
  MessageListRequest, NotificationMessageReadPayload,
  MessageCreatePayload, PrivateMessageCreatePayload
} from '../payloads';
import { MessageDto } from '../dtos';

@Injectable()
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly notificationMessageService: NotificationMessageService
  ) { }

  @Post('/private/file')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'message-photo',
        fieldName: 'message-photo',
        options: {
          destination: getConfig('file').imageDir
        }
      }
    ])
  )
  async createPrivateFileMessage(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: PrivateMessageCreatePayload,
    @Request() req: any
  ): Promise<DataResponse<MessageDto>> {
    if (req.authUser.sourceId.toString() === payload.recipientId.toString()) {
      throw new ForbiddenException();
    }

    const message = await this.messageService.createPrivateFileMessage(
      {
        source: req.authUser.source,
        sourceId: req.authUser.sourceId
      },
      {
        source: payload.recipientType,
        sourceId: payload.recipientId
      },
      files['message-photo'],
      payload
    );
    return DataResponse.ok(message);
  }

  @Post('/read-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async readAllMessage(
    @Body() payload: NotificationMessageReadPayload,
    @Request() req: any
  ): Promise<DataResponse<MessageDto>> {
    if (req.authUser.sourceId.toString() !== payload.recipientId.toString()) {
      throw new ForbiddenException();
    }
    const message = await this.notificationMessageService.recipientReadAllMessageInConversation(req.authUser.sourceId, payload.conversationId);
    return DataResponse.ok(message);
  }

  @Get('/counting-not-read-messages')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async countTotalNotReadMessage(
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.notificationMessageService.countTotalNotReadMessage(user);
    return DataResponse.ok(data);
  }

  @Get('/conversations/:conversationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadMessages(
    @Query() req: MessageListRequest,
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    req.conversationId = conversationId;
    const data = await this.messageService.loadMessages(req, user);
    return DataResponse.ok(data);
  }

  @Post('/conversations/:conversationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMessage(
    @Body() payload: MessageCreatePayload,
    @Param('conversationId') conversationId: string,
    @Request() req: any
  ): Promise<DataResponse<any>> {
    const data = await this.messageService.createPrivateMessageFromConversation(
      conversationId,
      payload,
      {
        source: req.authUser.source,
        sourceId: req.authUser.sourceId
      }
    );
    return DataResponse.ok(data);
  }

  @Post('/stream/conversations/:conversationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStreamMessage(
    @Body() payload: MessageCreatePayload,
    @Param('conversationId') conversationId: string,
    @Request() req: any
  ): Promise<DataResponse<any>> {
    const data = await this.messageService.createStreamMessageFromConversation(
      conversationId,
      payload,
      {
        source: req.authUser.source,
        sourceId: req.authUser.sourceId
      }
    );
    return DataResponse.ok(data);
  }

  @Post('/stream/public/conversations/:conversationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPublicStreamMessage(
    @Body() payload: MessageCreatePayload,
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.messageService.createPublicStreamMessageFromConversation(
      conversationId,
      payload,
      {
        source: req.authUser.source,
        sourceId: req.authUser.sourceId
      },
      user
    );
    return DataResponse.ok(data);
  }

  @Delete('/:messageId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePublicMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.messageService.deleteMessage(
      messageId,
      user
    );
    return DataResponse.ok(data);
  }

  @Delete('/:conversationId/remove-all-message')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteAllPublicMessage(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any
  ): Promise<DataResponse<any>> {
    const data = await this.messageService.deleteAllMessageInConversation(
      conversationId,
      user
    );
    return DataResponse.ok(data);
  }

  @Get('/conversations/public/:conversationId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadPublicMessages(
    @Query() req: MessageListRequest,
    @Param('conversationId') conversationId: string
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    req.conversationId = conversationId;
    const data = await this.messageService.loadPublicMessages(req);
    return DataResponse.ok(data);
  }
}
