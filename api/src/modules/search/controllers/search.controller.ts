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
  Body
} from '@nestjs/common';
import { LoadUser, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { SearchKeywordService } from 'src/modules/search/services/search.service';
import { SearchCreatePayload, SearchRequestPayload } from '../payloads';
import { SearchDto } from '../dtos/search.dto';
import { UserDto } from '../../user/dtos';

@Injectable()
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchKeywordService
  ) {}

  @Post('/keywords')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoadUser)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSearch(
    @Body() payload: SearchCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.searchService.countTotalBySource(payload, user);
    return DataResponse.ok(data);
  }

  @Get('/list/keywords')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('admin', 'performer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookmarkFeeds(
    @Query() query: SearchRequestPayload
  ): Promise<DataResponse<PageableData<SearchDto>>> {
    const data = await this.searchService.getSearchKeywords(query);
    return DataResponse.ok(data);
  }
}
