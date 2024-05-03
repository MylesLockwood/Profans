import { UserDto } from 'src/modules/user/dtos';
import { ObjectId } from 'mongodb';

export interface IFileUploadOptions {
  uploader?: UserDto;
  convertMp4?: boolean;
  generateThumbnail?: boolean;
  replaceByThumbnail?: boolean;
  thumbnailSize?: {
    width: number;
    height: number;
  },
  refItem?: {
    itemId: ObjectId;
    itemType: string;
  };
  fileName?: string | Function;
  destination?: string;
  server?: string;
  createThumbs?: boolean;
}
