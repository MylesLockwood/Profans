import {
  Controller,
  Injectable,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  Query
} from '@nestjs/common';
import { LoadUser } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { StoryService } from '../services';
import { StorySearchRequest } from '../payloads';

@Injectable()
@Controller('stories/users')
export class UserStoryController {
  constructor(
    private readonly storyService: StoryService
  ) {}

  @Get('')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerStories(
    @Query() query: StorySearchRequest,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.storyService.userSearchstories(query, user);
    return DataResponse.ok(data);
  }
}
