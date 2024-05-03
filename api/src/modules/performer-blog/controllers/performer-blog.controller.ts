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
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import {
  BlogCreatePayload, BlogSearchRequest
} from '../payloads';
import { BlogDto } from '../dtos';
import { BlogService } from '../services';

@Injectable()
@Controller('blogs/performers')
export class PerformerBlogController {
  constructor(
    private readonly blogService: BlogService
  ) {}

  @Post('/')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: BlogCreatePayload,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.blogService.createForPerformer(payload, performer as any);
    return DataResponse.ok(data);
  }

  @Get('/')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMyBlogs(
    @Query() query: BlogSearchRequest,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<PageableData<any>>> {
    const data = await this.blogService.searchBlogs(query, performer);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerBlog(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<BlogDto>> {
    const data = await this.blogService.findOne(id, user);
    return DataResponse.ok(data);
  }

  @Put('/:id')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBlog(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Body() payload: BlogCreatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.blogService.updateBlog(id, user, payload);
    return DataResponse.ok(data);
  }

  @Delete('/:id')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePerformerBlog(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.blogService.deleteBlog(id, user);
    return DataResponse.ok(data);
  }
}
