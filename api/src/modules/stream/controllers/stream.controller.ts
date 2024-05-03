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
  Get,
  Param,
  UseInterceptors,
  Put
} from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { PerformerDto } from 'src/modules/performer/dtos';
import { UserInterceptor } from 'src/modules/auth/interceptors';
import { UserDto } from 'src/modules/user/dtos';
import { StreamService } from '../services/stream.service';
import {
  StreamPayload, TokenCreatePayload, SetPricePayload, SetDurationPayload, PrivateCallRequestPayload
} from '../payloads';
import { Webhook } from '../dtos';
import { TokenResponse } from '../constant';

@Injectable()
@Controller('streaming')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('/session/:type')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSessionId(
    @CurrentUser() performer: PerformerDto,
    @Param() param: StreamPayload
  ): Promise<DataResponse<string>> {
    const sessionId = await this.streamService.getSessionId(
      performer._id,
      param.type
    );

    return DataResponse.ok(sessionId);
  }

  @Get('/session/:id/:type')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerSessionId(
    @Param() params: StreamPayload
  ): Promise<DataResponse<string>> {
    const sessionId = await this.streamService.getSessionId(
      params.id,
      params.type
    );

    return DataResponse.ok(sessionId);
  }

  @Post('/live')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async goLive(
    @CurrentUser() performer: PerformerDto
  ) {
    const data = await this.streamService.goLive(performer);
    return DataResponse.ok(data);
  }

  @Post('/join/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async join(@Param('id') performerId: string, @CurrentUser() user: UserDto) {
    const data = await this.streamService.joinPublicChat(performerId, user);
    return DataResponse.ok(data);
  }

  @Post('/private-chat/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async requestPrivateChat(
    @Param('id') performerId: string,
    @Body() payload: PrivateCallRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.streamService.requestPrivateChat(user, payload, performerId);
    return DataResponse.ok(data);
  }

  @Post('/private-chat/:id/decline')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async declinePrivateChat(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.streamService.declinePrivateChat(id, user);
    return DataResponse.ok(data);
  }

  @Get('/private-chat/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async accpetPrivateChat(
    @Param('id') id: string,
    @CurrentUser() performer: PerformerDto
  ): Promise<DataResponse<any>> {
    const data = await this.streamService.acceptPrivateChat(id, performer._id);
    return DataResponse.ok(data);
  }

  @Post('/antmedia/webhook')
  async antmediaWebhook(@Body() payload: Webhook) {
    await this.streamService.webhook(payload.sessionId || payload.id, payload);
    return DataResponse.ok();
  }

  @Post('/token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getOneTimeToken(
    @CurrentUser() user: UserDto,
    @Body() payload: TokenCreatePayload
  ): Promise<DataResponse<TokenResponse>> {
    const result = await this.streamService.getOneTimeToken(payload, user._id.toString());
    return DataResponse.ok(result);
  }

  @Put('/set-price')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async setPrice(
    @CurrentUser() user: UserDto,
    @Body() payload: SetPricePayload
  ): Promise<DataResponse<any>> {
    const result = await this.streamService.setStreamPrice(payload, user);
    return DataResponse.ok(result);
  }

  @Put('/set-duration')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async setDuration(
    @CurrentUser() user: UserDto,
    @Body() payload: SetDurationPayload
  ): Promise<DataResponse<any>> {
    const result = await this.streamService.updateStreamDuration(payload, user);
    return DataResponse.ok(result);
  }
}
