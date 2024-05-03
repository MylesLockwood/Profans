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
  Post,
  Body,
  Delete,
  Param
} from '@nestjs/common';
import {
  DataResponse
} from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { TrendingProfileCreatePayload } from '../payloads';
import { PerformerTrendingService } from '../services';

@Injectable()
@Controller('performers-trending')
export class PerformerTrendingController {
  constructor(
    private readonly performerTrendingService: PerformerTrendingService

  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async usearch(
    @Query() req: { listType: string }
  ): Promise<DataResponse<any>> {
    const data = await this.performerTrendingService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/random-search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async randomSearch(
    @Query() req: { listType: string, isFreeSubscription: boolean }
  ): Promise<DataResponse<any>> {
    const data = await this.performerTrendingService.randomSearch(req);
    return DataResponse.ok(data);
  }

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: TrendingProfileCreatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.performerTrendingService.create(payload);
    return DataResponse.ok(data);
  }

  @Post('/update-ordering')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateOrdering(
    @Body() payload: { ordering: number, performerId: string }
  ): Promise<DataResponse<any>> {
    const data = await this.performerTrendingService.update(payload);
    return DataResponse.ok(data);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.performerTrendingService.delete(id);
    return DataResponse.ok(data);
  }
}
