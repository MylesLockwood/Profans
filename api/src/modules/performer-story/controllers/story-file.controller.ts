import {
  Controller,
  Injectable,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';
// import {
//   FeedCreatePayload
// } from '../payloads';
import { StoryFileService } from '../services';

@Injectable()
@Controller('stories/performers')
export class StoryFileController {
  constructor(
    private readonly storyFileService: StoryFileService
  ) {}

  @Post('photo/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('story-photo', 'file', {
      destination: getConfig('file').photoDir
    })
  )
  async uploadImage(
    @CurrentUser() performer: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.storyFileService.validatePhoto(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }

  @Post('video/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('story-video', 'file', {
      destination: getConfig('file').videoDir,
      convertMp4: true
    })
  )
  async uploadVideo(
    @CurrentUser() performer: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.storyFileService.validateVideo(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }
}
