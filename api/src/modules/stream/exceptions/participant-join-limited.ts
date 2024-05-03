import { HttpException } from '@nestjs/common';

export class ParticipantJoinLimitException extends HttpException {
  constructor() {
    super('Participants have reached the limitation!', 400);
  }
}
