import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class InvalidStoryTypeException extends RuntimeException {
  constructor(msg: string | object = 'Invalid story type', error = 'INVALID_STORY_TYPE') {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
