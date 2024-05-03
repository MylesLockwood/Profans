import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  PaymentTransactionSchema,
  OrderSchema,
  OrderDetailsSchema,
  PaymentGatewaySettingSchema,
  BankingSettingSchema
} from '../schemas';

export const PAYMENT_TRANSACTION_MODEL_PROVIDER = 'PAYMENT_TRANSACTION_MODEL_PROVIDER';
export const PAYMENT_GATEWAY_SETTING_MODEL_PROVIDER = 'PAYMENT_GATEWAY_SETTING_MODEL_PROVIDER';
export const BANKING_SETTING_MODEL_PROVIDER = 'BANKING_SETTING_MODEL_PROVIDER';

export const paymentProviders = [
  {
    provide: PAYMENT_TRANSACTION_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PaymentTransaction', PaymentTransactionSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PAYMENT_GATEWAY_SETTING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model(
      'PaymentGatewaySettings',
      PaymentGatewaySettingSchema
    ),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: BANKING_SETTING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('BankingSettings', BankingSettingSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];

export const ORDER_MODEL_PROVIDER = 'ORDER_MODEL_PROVIDER';

export const ORDER_DETAIL_MODEL_PROVIDER = 'ORDER_DETAIL_MODEL_PROVIDER';

export const orderProviders = [
  {
    provide: ORDER_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Order', OrderSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: ORDER_DETAIL_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('OrderDetails', OrderDetailsSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
