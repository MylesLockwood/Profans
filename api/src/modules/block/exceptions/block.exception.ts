import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class PerformerBlockedException extends RuntimeException {
  constructor(msg: string | object = 'You have been blocked by this content creator', error = 'ALREADY_BLOCKED') {
    super(msg, error, HttpStatus.FORBIDDEN);
  }
}
