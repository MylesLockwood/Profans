import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class InvalidFeedTypeException extends RuntimeException {
  constructor(msg: string | object = 'Invalid feed type', error = 'INVALID_FEED_TYPE') {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}

export class MissingFieldsException extends RuntimeException {
  constructor(msg: string | object = 'Missing required properties', error = 'MISSING_REQUIRED_PROPS') {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
