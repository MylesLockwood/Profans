export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  CANCELLED: 'cancelled'
};
export const PAYMENT_TYPE = {
  MONTHLY_SUBSCRIPTION: 'monthly_subscription',
  YEARLY_SUBSCRIPTION: 'yearly_subscription',
  FREE_SUBSCRIPTION: 'free_subscription',
  TIP_PERFORMER: 'tip_performer',
  PERFORMER_VIDEO: 'performer_video',
  PERFORMER_PRODUCT: 'performer_product',
  PERFORMER_POST: 'performer_post',
  PUBLIC_CHAT: 'public_chat',
  PRIVATE_CHAT: 'private_chat',
  AUTHORISE_CARD: 'authorise_card'
};
export const PAYMENT_TARTGET_TYPE = {
  PERFORMER: 'performer',
  PERFORMER_PRODUCT: 'performer_product',
  PERFORMER_VIDEO: 'performer_video',
  PERFORMER_POST: 'performer_post',
  PUBLIC_CHAT: 'public_chat',
  PRIVATE_CHAT: 'private_chat',
  AUTHORISE_CARD: 'authorise_card'
};

export const TRANSACTION_SUCCESS_CHANNEL = 'TRANSACTION_SUCCESS_CHANNEL';
export const ORDER_PAID_SUCCESS_CHANNEL = 'ORDER_PAID_SUCCESS_CHANNEL';

export const OVER_PRODUCT_STOCK = 'OVER_PRODUCT_STOCK';
export const DIFFERENT_PERFORMER_PRODUCT = 'DIFFERENT_PERFORMER_PRODUCT';
export const MISSING_CONFIG_PAYMENT_GATEWAY = 'Missing payment configuration for this content creator';

export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  PENDING: 'pending',
  CREATED: 'created',
  PAID: 'paid'
};

export const DELIVERY_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  CREATED: 'created'
};

export const PRODUCT_TYPE = {
  MONTHLY_SUBSCRIPTION: 'monthly_subscription',
  YEARLY_SUBSCRIPTION: 'yearly_subscription',
  FREE_SUBSCRIPTION: 'free_subscription',
  SALE_VIDEO: 'sale_video',
  SALE_POST: 'sale_post',
  TIP_PERFORMER: 'tip_performer',
  DIGITAL_PRODUCT: 'digital_product',
  PHYSICAL_PRODUCT: 'physical_product',
  PUBLIC_CHAT: 'public_chat',
  PRIVATE_CHAT: 'private_chat',
  AUTHORISE_CARD: 'authorise_card'
};

export const SELLER_SOURCE = {
  PERFORMER: 'performer',
  ADMIN: 'admin'
};

export const BUYER_SOURCE = {
  USER: 'user'
};

export const PAY_SOURCE = {
  MONEY: 'money',
  TOKEN: 'token'
};
