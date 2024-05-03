import {
  Injectable
} from '@nestjs/common';
import { FileDto } from 'src/modules/file';
import { FileService } from 'src/modules/file/services';
import { InvalidFeedTypeException } from '../exceptions';
import { FEED_VIDEO_CHANNEL } from '../constants';

@Injectable()
export class FeedFileService {
  constructor(
    private readonly fileService: FileService
  ) { }

  public async validatePhoto(photo: FileDto): Promise<any> {
    if (!photo.isImage()) {
      await this.fileService.remove(photo._id);

      throw new InvalidFeedTypeException('Invalid photo file!');
    }

    return true;
  }

  public async validateVideo(video: FileDto): Promise<any> {
    if (!video.isVideo()) {
      await this.fileService.remove(video._id);

      throw new InvalidFeedTypeException('Invalid video file!');
    }

    await this.fileService.queueProcessVideo(video._id, {
      publishChannel: FEED_VIDEO_CHANNEL,
      meta: {
        videoId: video._id
      }
    });

    return true;
  }
}
