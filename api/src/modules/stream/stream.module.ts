import { Module, forwardRef, HttpModule } from '@nestjs/common';
import * as https from 'https';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { SubscriptionModule } from 'src/modules/subscription/subscription.module';
import { assetsProviders } from './providers/stream.provider';
import { PerformerModule } from '../performer/performer.module';
import { AuthModule } from '../auth/auth.module';
import { StreamService, RequestService } from './services';
import { StreamController } from './controllers';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import { SocketModule } from '../socket/socket.module';
import { StreamConversationWsGateway, PrivateStreamWsGateway, PublicStreamWsGateway } from './gateways';
import { StreamMessageListener, StreamConnectListener, PrivateChatPaymentListener } from './listeners';
import { SettingModule } from '../settings/setting.module';
import { PaymentModule } from '../payment/payment.module';

const agent = new https.Agent({
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED !== 'false'
});

@Module({
  imports: [
    MongoDBModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      httpsAgent: agent
    }),
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => MessageModule),
    forwardRef(() => SocketModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => MessageModule),
    forwardRef(() => SettingModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...assetsProviders,
    StreamService,
    RequestService,
    StreamMessageListener,
    StreamConnectListener,
    PrivateChatPaymentListener,
    StreamConversationWsGateway,
    PrivateStreamWsGateway,
    PublicStreamWsGateway
  ],
  controllers: [StreamController],
  exports: [StreamService]
})
export class StreamModule {}
