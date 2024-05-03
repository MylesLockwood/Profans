import { HttpException } from '@nestjs/common';

export class EmailHasBeenTakenException extends HttpException {
  constructor() {
    super('Email has been sent to you, please check your email', 403);
  }
}
