import { HttpException } from '@nestjs/common';

export class InvalidRequestTokenException extends HttpException {
  constructor() {
    super('Your request tokens is greater than your balance, please recheck again', 422);
  }
}
