/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException
} from '@nestjs/common';
import { PerformerService } from 'src/modules/performer/services';
import {
  ProductService, VideoService
} from 'src/modules/performer-assets/services';
import { FeedService } from 'src/modules/feed/services';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import {
  EntityNotFoundException
} from 'src/kernel';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import * as moment from 'moment';
import { UserService } from 'src/modules/user/services';
import { MailerService } from 'src/modules/mailer';
import { CouponService } from 'src/modules/coupon/services';
import { SUBSCRIPTION_TYPE } from 'src/modules/subscription/constants';
import { PRODUCT_TYPE as PERFORMER_PRODUCT_TYPE } from 'src/modules/performer-assets/constants';
import { StreamService } from 'src/modules/stream/services';
import { FeedDto } from 'src/modules/feed/dtos';
import { ORDER_DETAIL_MODEL_PROVIDER, ORDER_MODEL_PROVIDER } from '../providers';
import { OrderDetailsModel, OrderModel } from '../models';
import {
  OrderSearchPayload, OrderUpdatePayload, PurchaseFeedPayload, PurchaseProductsPayload, PurchaseStreamPayload, PurchaseVideoPayload, SendTipPayload, SubscribePerformerPayload
} from '../payloads';
import {
  BUYER_SOURCE,
  DELIVERY_STATUS,
  ORDER_STATUS,
  PAYMENT_TYPE,
  PRODUCT_TYPE,
  SELLER_SOURCE,
  PAY_SOURCE
} from '../constants';
import { OrderDetailsDto, OrderDto } from '../dtos';
import { DifferentPerformerException } from '../exceptions';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => VideoService))
    private readonly videoService: VideoService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => StreamService))
    private readonly streamService: StreamService,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(ORDER_DETAIL_MODEL_PROVIDER)
    private readonly orderDetailModel: Model<OrderDetailsModel>,
    private readonly mailService: MailerService
  ) { }

  public async findById(id: string | ObjectId) {
    return this.orderModel.findById(id);
  }

  public async findByIds(ids: string[] | ObjectId[]) {
    return this.orderModel.find({ _id: { $in: ids } });
  }

  public async findByQuery(payload: any) {
    const data = await this.orderModel.find(payload);
    return data;
  }

  public async findOderDetailsByQuery(payload: any) {
    const data = await this.orderDetailModel.find(payload);
    return data;
  }

  public async findOneOderDetails(payload: any) {
    const data = await this.orderDetailModel.findOne(payload);
    return data;
  }

  /**
   * search in order collections
   * @param req
   * @param user
   */
  public async search(req: OrderSearchPayload) {
    const query = {
      status: {
        $ne: ORDER_STATUS.CREATED
      }
    } as any;
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.buyerId) query.buyerId = req.buyerId;
    if (req.userId) query.buyerId = req.userId;
    if (req.status) query.status = req.status;
    if (req.deliveryStatus) query.deliveryStatus = req.deliveryStatus;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lt: moment(req.toDate).startOf('day').toDate()
      };
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.orderModel.countDocuments(query)
    ]);
    const data = orders.map((o) => new OrderDto(o));
    const orderIds = orders.map((o) => o._id);
    const performerIds = orders.filter((o) => o.sellerSource === SELLER_SOURCE.PERFORMER).map((o) => o.sellerId);
    const userIds = orders.filter((o) => o.buyerSource === BUYER_SOURCE.USER).map((o) => o.buyerId);
    const sellers = [];
    const buyers = [];
    const orderDetails = [];
    if (performerIds.length) {
      const performers = await this.performerService.findByIds(performerIds);
      sellers.push(
        ...performers.map((p) => (new PerformerDto(p)).toResponse())
      );
    }
    if (userIds.length) {
      const users = await this.userService.findByIds(userIds);
      buyers.push(
        ...users.map((u) => (new UserDto(u)).toResponse())
      );
    }

    if (orderIds.length) {
      const orderDetailsList = await this.orderDetailModel.find({
        orderId: {
          $in: orderIds
        }
      });
      orderDetails.push(...orderDetailsList);
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const order of data) {
      if (order.sellerId) {
        order.seller = sellers.find((s) => s._id.toString() === order.sellerId.toString());
      }
      if (order.buyerId) {
        order.buyer = buyers.find((b) => b._id.toString() === order.buyerId.toString());
      }
      order.details = orderDetails.filter((d) => d.orderId.toString() === order._id.toString());
    }

    return {
      data,
      total
    };
  }

  public async orderDetailsSearch(req: OrderSearchPayload) {
    const query = {
      status: {
        $ne: ORDER_STATUS.CREATED
      }
    } as any;
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.buyerId) query.buyerId = req.buyerId;
    if (req.userId) query.buyerId = req.userId;
    if (req.status) query.status = req.status;
    if (req.deliveryStatus) query.deliveryStatus = req.deliveryStatus;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lt: moment(req.toDate).startOf('day').toDate()
      };
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [orders, total] = await Promise.all([
      this.orderDetailModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.orderDetailModel.countDocuments(query)
    ]);

    const sellers = [];
    const buyers = [];
    const performerIds = orders.filter((o) => o.sellerSource === SELLER_SOURCE.PERFORMER).map((o) => o.sellerId);
    const userIds = orders.filter((o) => o.buyerSource === BUYER_SOURCE.USER).map((o) => o.buyerId);
    if (performerIds.length) {
      const performers = await this.performerService.findByIds(performerIds);
      sellers.push(
        ...performers.map((p) => (new PerformerDto(p)).toResponse())
      );
    }
    if (userIds.length) {
      const users = await this.userService.findByIds(userIds);
      buyers.push(
        ...users.map((u) => (new UserDto(u)).toResponse())
      );
    }

    const data = orders.map((o) => new OrderDetailsDto(o).toResponse());

    // eslint-disable-next-line no-restricted-syntax
    for (const order of data) {
      if (order.sellerId) {
        order.seller = sellers.find((s) => s._id.toString() === order.sellerId.toString());
      }
      if (order.buyerId) {
        order.buyer = buyers.find((b) => b._id.toString() === order.buyerId.toString());
      }
    }

    return {
      data,
      total
    };
  }

  public async getOrderDetails(id: string | ObjectId) {
    const details = await this.orderDetailModel.findById(id);
    if (!details) {
      throw new EntityNotFoundException();
    }

    const dto = new OrderDetailsDto(details.toObject()).toResponse();
    if (details.buyerSource === BUYER_SOURCE.USER) {
      const user = await this.userService.findById(details.buyerId);
      dto.buyer = (new UserDto(user)).toResponse();
    }

    if (details.sellerSource === SELLER_SOURCE.PERFORMER) {
      const performer = await this.performerService.findById(details.sellerId);
      dto.seller = (new PerformerDto(performer)).toResponse();
    }

    if (dto.productType === PRODUCT_TYPE.SALE_POST && dto.productId) {
      const feed = await this.feedService.findById(dto.productId);
      dto.productInfo = (feed && new FeedDto(feed)) || null;
    }
    return dto;
  }

  public async updateDetails(id: string, payload: OrderUpdatePayload, currentUser: UserDto) {
    const details = await this.orderDetailModel.findById(id);
    if (!details) {
      throw new EntityNotFoundException();
    }

    const oldStatus = details.deliveryStatus;
    if (!currentUser.roles?.includes('admin') && currentUser._id.toString() !== details.sellerId.toString()) {
      throw new ForbiddenException();
    }

    await this.orderDetailModel.updateOne({ _id: id }, payload);
    const newUpdate = await this.orderDetailModel.findById(id);
    if (newUpdate.deliveryStatus !== oldStatus) {
      if (details.buyerSource === BUYER_SOURCE.USER) {
        const user = await this.userService.findById(details.buyerId);
        if (user) {
          await this.mailService.send({
            subject: 'Order Status Changed',
            to: user.email,
            data: {
              user,
              order: newUpdate,
              deliveryStatus: newUpdate.deliveryStatus,
              oldDeliveryStatus: oldStatus
            },
            template: 'update-order-status.html'
          });
        }
      }
    }
  }

  public generateOrderNumber() {
    const now = new Date();
    return `O-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${now.getHours()}${now.getSeconds()}`.toUpperCase();
  }

  /**
   * get list of sub orders
   * @param orderId order id
   */
  public async getDetails(orderId: string | ObjectId): Promise<any> {
    // TODO - should convert to oder details DTO?
    return this.orderDetailModel.find({
      orderId
    });
  }

  /**
   * create order with created status, means just place cart to order and waiting to process
   * @param payload
   * @param user
   * @param orderStatus
   */
  public async createForPerformerProducts(payload: PurchaseProductsPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    const { products, deliveryAddress } = payload;
    const productIds = payload.products.map((p) => p._id);
    const prods = await this.productService.findByIds(productIds);
    if (!products.length || !prods.length) {
      throw new EntityNotFoundException();
    }
    const checkSamePerformerProducts = prods.filter((p) => p.performerId.toString() === prods[0].performerId.toString());
    if (checkSamePerformerProducts.length !== prods.length) {
      throw new DifferentPerformerException();
    }
    const { performerId } = prods[0];
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    let totalQuantity = 0;
    let originalPrice = 0;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }

    const orderDetails = [];
    prods.forEach((p) => {
      const groupProducts = products.filter((op) => op._id.toString() === p._id.toString());
      let productQuantity = 0;
      groupProducts.forEach((op) => {
        productQuantity += op.quantity;
      });
      const originalProductPrice = productQuantity * p.price;
      const productPrice = coupon ? (originalProductPrice - (originalProductPrice * coupon.value) as any) : originalProductPrice;
      totalQuantity += productQuantity;
      originalPrice += originalProductPrice;
      orderDetails.push({
        buyerId: user._id,
        buyerSource: BUYER_SOURCE.USER,
        sellerId: performerId,
        sellerSource: SELLER_SOURCE.PERFORMER,
        name: p.name,
        description: p.description,
        unitPrice: p.price,
        originalPrice: originalProductPrice,
        totalPrice: productPrice,
        productType: p.type === PERFORMER_PRODUCT_TYPE.DIGITAL ? PRODUCT_TYPE.DIGITAL_PRODUCT : PRODUCT_TYPE.PHYSICAL_PRODUCT,
        productId: p._id,
        quantity: productQuantity,
        payBy: PAY_SOURCE.MONEY,
        deliveryStatus: DELIVERY_STATUS.CREATED,
        deliveryAddress,
        couponInfo: coupon,
        status: orderStatus
      });
    });

    const totalPrice = coupon ? (originalPrice - (originalPrice * coupon.value)) : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: PAYMENT_TYPE.PERFORMER_PRODUCT,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: totalQuantity,
      originalPrice,
      totalPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await Promise.all(orderDetails.map((detail, index) => {
      detail.orderId = order._id;
      detail.orderNumber = `${order.orderNumber}-S${index + 1}`;
      return this.orderDetailModel.create(detail);
    }));

    return order;
  }

  public async createForPerformerVOD(payload: PurchaseVideoPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    // TODO - check if VOD video has been purchased
    const video = await this.videoService.findById(payload.videoId);
    if (!video?.isSaleVideo || !video?.price) {
      throw new EntityNotFoundException();
    }
    const { performerId } = video;
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const totalQuantity = 1;
    const originalPrice = video.price;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }
    const productPrice = coupon ? (originalPrice - (originalPrice * coupon.value) as any) : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: PAYMENT_TYPE.PERFORMER_VIDEO,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: totalQuantity,
      originalPrice,
      totalPrice: productPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name: video.title,
      description: video.description,
      unitPrice: video.price,
      originalPrice,
      totalPrice: productPrice,
      productType: PRODUCT_TYPE.SALE_VIDEO,
      productId: video._id,
      quantity: 1,
      payBy: PAY_SOURCE.MONEY,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: coupon,
      status: orderStatus
    });

    return order;
  }

  public async createForPerformerSubscription(payload: SubscribePerformerPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    const { type, performerId } = payload;
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    const price = type === SUBSCRIPTION_TYPE.MONTHLY ? performer.monthlyPrice : type === SUBSCRIPTION_TYPE.YEARLY ? performer.yearlyPrice : 0;
    const productType = type === SUBSCRIPTION_TYPE.MONTHLY ? PAYMENT_TYPE.MONTHLY_SUBSCRIPTION : type === SUBSCRIPTION_TYPE.YEARLY ? PAYMENT_TYPE.YEARLY_SUBSCRIPTION : PAYMENT_TYPE.FREE_SUBSCRIPTION;
    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: productType,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      originalPrice: price,
      totalPrice: price,
      couponInfo: null,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const name = performer.username || performer.name;
    const description = type === SUBSCRIPTION_TYPE.MONTHLY ? `Monthly subscription for ${performer.username}` : type === SUBSCRIPTION_TYPE.FREE ? `Free subscription for ${performer.username}` : `Yearly subscription for ${performer.username}`;
    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name,
      description,
      unitPrice: price,
      originalPrice: price,
      totalPrice: price,
      productType,
      productId: performer._id,
      quantity: 1,
      status: orderStatus,
      payBy: PAY_SOURCE.MONEY, // default!!
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null
    });

    return order;
  }

  public async createForPerformerSubscriptionRenewal({
    userId,
    performerId,
    type,
    price
  }, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    const user = await this.userService.findById(userId);
    const order = await this.orderModel.create({
      buyerId: userId,
      buyerSource,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: type === SUBSCRIPTION_TYPE.MONTHLY ? PAYMENT_TYPE.MONTHLY_SUBSCRIPTION : PAYMENT_TYPE.YEARLY_SUBSCRIPTION,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      originalPrice: price,
      totalPrice: price,
      couponInfo: null,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const name = `Renewal subscription for ${performer.username}`;
    const description = name;
    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name,
      description,
      unitPrice: price,
      originalPrice: price,
      totalPrice: price,
      productType: type === SUBSCRIPTION_TYPE.MONTHLY ? PAYMENT_TYPE.MONTHLY_SUBSCRIPTION : PAYMENT_TYPE.YEARLY_SUBSCRIPTION,
      productId: performer._id,
      quantity: 1,
      payBy: PAY_SOURCE.MONEY,
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null
    });

    return order;
  }

  public async createForTipPerformer(payload: SendTipPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    const { performerId, price } = payload;
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: PAYMENT_TYPE.TIP_PERFORMER,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      originalPrice: price,
      totalPrice: price,
      couponInfo: null,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performerId,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name: `Tip to ${performer.name || performer.username}`,
      description: `Tip to ${performer.name || performer.username}`,
      unitPrice: price,
      originalPrice: price,
      totalPrice: price,
      productType: PRODUCT_TYPE.TIP_PERFORMER,
      productId: performer._id,
      quantity: 1,
      status: orderStatus,
      payBy: PAY_SOURCE.MONEY, // default!!
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null
    });

    return order;
  }

  public async createForPerformerPost(payload: PurchaseFeedPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    // TODO - check if post
    const feed = await this.feedService.findById(payload.feedId);
    if (!feed || !feed.isSale || !feed.price) {
      throw new EntityNotFoundException();
    }
    const { fromSourceId } = feed;
    const performer = await this.performerService.findById(fromSourceId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const totalQuantity = 1;
    const originalPrice = feed.price;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }
    const productPrice = coupon ? (originalPrice - (originalPrice * coupon.value) as any) : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performer._id,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: PAYMENT_TYPE.PERFORMER_POST,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: totalQuantity,
      originalPrice,
      totalPrice: productPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performer._id,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name: `Purchase ${performer.name || performer.username} post`,
      description: feed.text,
      unitPrice: feed.price,
      originalPrice,
      totalPrice: productPrice,
      productType: PRODUCT_TYPE.SALE_POST,
      productId: feed._id,
      quantity: 1,
      payBy: PAY_SOURCE.MONEY,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: coupon,
      status: orderStatus
    });

    return order;
  }

  public async createAuthorizationCard(user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    const totalQuantity = 1;
    const originalPrice = 2.95; // minimum transaction size starting from $2.95
    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: null,
      sellerSource: SELLER_SOURCE.ADMIN,
      type: PAYMENT_TYPE.AUTHORISE_CARD,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: totalQuantity,
      originalPrice,
      totalPrice: originalPrice,
      couponInfo: null,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: null,
      sellerSource: SELLER_SOURCE.ADMIN,
      name: 'Authorised card',
      description: 'authorised card',
      unitPrice: originalPrice,
      originalPrice,
      totalPrice: originalPrice,
      productType: PRODUCT_TYPE.AUTHORISE_CARD,
      productId: null,
      quantity: 1,
      payBy: PAY_SOURCE.MONEY,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null,
      status: orderStatus
    });

    return order;
  }

  public async createForPerformerStream(payload: PurchaseStreamPayload, user: UserDto, buyerSource = BUYER_SOURCE.USER, orderStatus = ORDER_STATUS.CREATED) {
    // TODO - check if post
    const stream = await this.streamService.findById(payload.streamId);
    if (!stream || !stream.price) {
      throw new EntityNotFoundException();
    }
    const { performerId } = stream;
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const totalQuantity = 1;
    const originalPrice = stream.price;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }
    const productPrice = coupon ? (originalPrice - (originalPrice * coupon.value) as any) : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: performer._id,
      sellerSource: SELLER_SOURCE.PERFORMER,
      type: payload.type,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: totalQuantity,
      originalPrice,
      totalPrice: productPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}-S1`,
      buyerId: user._id,
      buyerSource: BUYER_SOURCE.USER,
      sellerId: performer._id,
      sellerSource: SELLER_SOURCE.PERFORMER,
      name: `${performer.name || performer.username} ${payload.type} chat`,
      description: `${performer.name || performer.username} ${payload.type} session ${stream.sessionId}`,
      unitPrice: stream.price,
      originalPrice,
      totalPrice: productPrice,
      productType: payload.type,
      productId: stream._id,
      productSessionId: stream.sessionId,
      quantity: 1,
      payBy: PAY_SOURCE.MONEY,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: coupon,
      status: orderStatus
    });

    return order;
  }
}
