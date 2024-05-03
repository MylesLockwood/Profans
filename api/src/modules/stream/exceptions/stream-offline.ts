import { HttpException } from '@nestjs/common';

export class StreamOfflineException extends HttpException {
  constructor() {
    super('Stream is offline', 400);
  }
}
