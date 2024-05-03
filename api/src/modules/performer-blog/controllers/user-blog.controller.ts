import {
  Controller,
  Injectable,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  Param
} from '@nestjs/common';
import { LoadUser } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { BlogService } from '../services';
import { BlogSearchRequest } from '../payloads';
import { BlogDto } from '../dtos';

@Injectable()
@Controller('blogs/users')
export class UserBlogController {
  constructor(
    private readonly blogService: BlogService
  ) {}

  @Get('')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerBlogs(
    @Query() query: BlogSearchRequest,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.blogService.searchBlogs(query, user);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerBlog(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<BlogDto>> {
    const data = await this.blogService.findOne(id, user);
    return DataResponse.ok(data);
  }
}
