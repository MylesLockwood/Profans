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
import { Roles } from 'src/modules/auth';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';
import { FeedFileService } from '../services';

@Injectable()
@Controller('feeds/performers')
export class FeedFileController {
  constructor(
    private readonly feedFileService: FeedFileService
  ) {}

  @Post('photo/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('feed-photo', 'file', {
      destination: getConfig('file').feedProtectedDir
    })
  )
  async uploadImage(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.feedFileService.validatePhoto(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }

  @Post('video/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('feed-video', 'file', {
      destination: getConfig('file').feedProtectedDir,
      convertMp4: true
    })
  )
  async uploadVideo(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.feedFileService.validateVideo(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }

  @Post('thumbnail/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('feed-photo', 'file', {
      destination: getConfig('file').feedDir
    })
  )
  async uploadThumb(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.feedFileService.validatePhoto(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }

  @Post('teaser/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('feed-video', 'file', {
      destination: getConfig('file').feedDir
    })
  )
  async uploadTeaser(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.feedFileService.validateVideo(file);
    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }
}
