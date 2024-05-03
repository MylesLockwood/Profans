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
  Param,
  Post,
  Body,
  Delete,
  Put
} from '@nestjs/common';
import { AuthGuard, LoadUser } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { CommentService } from '../services/comment.service';
import { CommentCreatePayload, CommentEditPayload, CommentSearchRequestPayload } from '../payloads';
import { CommentDto } from '../dtos/comment.dto';
import { UserDto } from '../../user/dtos';

@Injectable()
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() user: UserDto,
    @Body() payload: CommentCreatePayload
  ): Promise<DataResponse<CommentDto>> {
    const comment = await this.commentService.create(payload, user);
    return DataResponse.ok(comment);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDto,
    @Body() payload: CommentEditPayload
  ): Promise<DataResponse<any>> {
    const comment = await this.commentService.update(
      id,
      payload,
      currentUser
    );
    return DataResponse.ok(comment);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoadUser)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: CommentSearchRequestPayload,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<PageableData<CommentDto>>> {
    const comments = await this.commentService.search(req, currentUser);
    return DataResponse.ok(comments);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.commentService.delete(id, currentUser);
    return DataResponse.ok(data);
  }
}
