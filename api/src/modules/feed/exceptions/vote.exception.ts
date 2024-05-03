import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class AlreadyVotedException extends RuntimeException {
  constructor(msg: string | object = 'You have already voted it', error = 'ALREADY_VOTED') {
    super(msg, error, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class PollExpiredException extends RuntimeException {
  constructor(msg: string | object = 'This poll has already expired to vote', error = 'ALREADY_EXPIRED_TO_VOTE') {
    super(msg, error, HttpStatus.FORBIDDEN);
  }
}
