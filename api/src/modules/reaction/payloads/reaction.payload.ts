import {
  IsString, IsOptional, IsNotEmpty, IsIn
} from 'class-validator';
import { REACTION, REACTION_TYPE } from '../constants';

export class ReactionCreatePayload {
  @IsString()
  @IsOptional()
  @IsIn([
    REACTION_TYPE.VIDEO,
    REACTION_TYPE.PERFORMER,
    REACTION_TYPE.FEED_PHOTO,
    REACTION_TYPE.FEED_TEXT,
    REACTION_TYPE.FEED_VIDEO,
    REACTION_TYPE.COMMENT,
    REACTION_TYPE.GALLERY,
    REACTION_TYPE.PRODUCT,
    REACTION_TYPE.STORY
  ])
  objectType = REACTION_TYPE.VIDEO;

  @IsString()
  @IsOptional()
  @IsIn([
    REACTION.LIKE,
    REACTION.FAVOURITE,
    REACTION.WATCH_LATER,
    REACTION.BOOK_MARK
  ])
  action: string;

  @IsString()
  @IsNotEmpty()
  objectId: string;
}
