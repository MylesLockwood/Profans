import { IsNotEmpty, IsIn } from 'class-validator';
import { SUBSCRIPTION_TYPE } from 'src/modules/subscription/constants';

export class SubscribePerformerPayload {
  @IsNotEmpty()
  performerId: string;

  @IsNotEmpty()
  @IsIn([
    SUBSCRIPTION_TYPE.FREE,
    SUBSCRIPTION_TYPE.MONTHLY,
    SUBSCRIPTION_TYPE.YEARLY
  ])
  type: string;
}
