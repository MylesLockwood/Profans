import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { userProviders } from './providers';
import {
  UserController,
  AvatarController,
  AdminUserController,
  AdminAvatarController
} from './controllers';
import { UserService, UserSearchService } from './services';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { UserConnectedListener } from './listeners/user-connected.listener';
import { PerformerModule } from '../performer/performer.module';
import { BlockModule } from '../block/block.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => FileModule),
    forwardRef(() => BlockModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...userProviders,
    UserService,
    UserSearchService,
    UserConnectedListener
  ],
  controllers: [
    UserController,
    AvatarController,
    AdminUserController,
    AdminAvatarController
  ],
  exports: [...userProviders, UserService, UserSearchService]
})
export class UserModule {}
