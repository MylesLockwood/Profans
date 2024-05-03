import { HttpException } from '@nestjs/common';

export class EmailExistedException extends HttpException {
  constructor() {
    super('Email has been sent to you, please check your email', 422);
  }
}
