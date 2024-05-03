import {
  Injectable
} from '@nestjs/common';
import { FileDto } from 'src/modules/file';
import { FileService } from 'src/modules/file/services';
import { InvalidStoryTypeException } from 'src/modules/performer-story/exceptions';

@Injectable()
export class BlogFileService {
  constructor(
    private readonly fileService: FileService
  ) {

  }

  public async validatePhoto(photo: FileDto): Promise<any> {
    if (!photo.isImage()) {
      await this.fileService.remove(photo._id);

      throw new InvalidStoryTypeException('Invalid photo file!');
    }

    return true;
  }

  public async validateVideo(video: FileDto): Promise<any> {
    if (!video.isVideo()) {
      await this.fileService.remove(video._id);

      throw new InvalidStoryTypeException('Invalid video file!');
    }

    return true;
  }
}
