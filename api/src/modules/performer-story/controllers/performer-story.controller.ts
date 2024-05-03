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
import { RoleGuard, AuthGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import {
  StoryCreatePayload, StorySearchRequest
} from '../payloads';
import { StoryDto } from '../dtos';
import { StoryService } from '../services';

@Injectable()
@Controller('stories/performers')
export class PerformerStoryController {
  constructor(
    private readonly storyService: StoryService
  ) {}

  @Post('/')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: StoryCreatePayload,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.storyService.createForPerformer(payload, performer as any);
    return DataResponse.ok(data);
  }

  @Get('/')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMyStories(
    @Query() query: StorySearchRequest,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<PageableData<any>>> {
    const data = await this.storyService.getPerformerstories(query, performer);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerStory(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<StoryDto>> {
    const data = await this.storyService.findOne(id, user);
    return DataResponse.ok(data);
  }

  @Put('/:id')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStory(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Body() payload: StoryCreatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.storyService.updateStory(id, user, payload);
    return DataResponse.ok(data);
  }

  @Delete('/:id')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePerformerStory(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.storyService.deleteStory(id, user);
    return DataResponse.ok(data);
  }
}
