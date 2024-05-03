import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  forwardRef,
  Inject
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { AuthGuard } from 'src/modules/auth/guards';
import { PhotoService } from '../services/photo.service';
import { PhotoSearchService } from '../services/photo-search.service';
import { PhotoSearchRequest } from '../payloads';
import { AuthService } from '../../auth/services';

@Injectable()
@Controller('user/performer-assets/:performerId/photos')
export class UserPhotosController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly photoService: PhotoService,
    private readonly photoSearchService: PhotoSearchService

  ) {}

  @Get('/')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('performerId') performerId: string,
    @Query() query: PhotoSearchRequest,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    // TODO - filter for subscriber
    // eslint-disable-next-line no-param-reassign
    query.performerId = performerId;
    const auth = { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = await this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const data = await this.photoSearchService.getModelPhotosWithGalleryCheck(query, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async details(@Param('id') id: string, @CurrentUser() user: UserDto) {
    // TODO - filter for subscriber
    const details = await this.photoService.details(id, user);
    return DataResponse.ok(details);
  }
}
