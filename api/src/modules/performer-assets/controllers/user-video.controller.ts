import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Request,
  Inject,
  forwardRef
} from '@nestjs/common';
import { DataResponse, ForbiddenException } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { LoadUser } from 'src/modules/auth/guards';
import { VideoService } from '../services/video.service';
import { VideoSearchRequest } from '../payloads';
import { VideoSearchService } from '../services/video-search.service';
import { AuthService } from '../../auth/services';

@Injectable()
@Controller('user/performer-assets/videos')
export class UserVideosController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoSearchService: VideoSearchService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) { }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() req: VideoSearchRequest) {
    const resp = await this.videoSearchService.userSearch(req);
    return DataResponse.ok(resp);
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() req: any
  ) {
    if (!req.query.token) throw new ForbiddenException();
    const user = await this.authService.getSourceFromJWT(req.query.token);
    if (!user) {
      throw new ForbiddenException();
    }
    const valid = await this.videoService.checkAuth(req, user);
    return DataResponse.ok(valid);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoadUser)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = req.authUser && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const details = await this.videoService.userGetDetails(id, user, jwToken);
    return DataResponse.ok(details);
  }
}
