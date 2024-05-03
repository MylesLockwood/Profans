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
import { BlogFileService } from '../services';

@Injectable()
@Controller('blogs/performers')
export class StoryFileController {
  constructor(
    private readonly blogFileService: BlogFileService
  ) {}

  @Post('photo/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('blog-photo', 'file', {
      destination: getConfig('file').photoDir
    })
  )
  async uploadImage(
    @CurrentUser() performer: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.blogFileService.validatePhoto(file);

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
    FileUploadInterceptor('blog-video', 'file', {
      destination: getConfig('file').videoDir,
      convertMp4: true
    })
  )
  async uploadVideo(
    @CurrentUser() performer: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.blogFileService.validateVideo(file);

    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }
}
