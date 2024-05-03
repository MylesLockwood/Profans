import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { ORDER_PAID_SUCCESS_CHANNEL, SELLER_SOURCE, PRODUCT_TYPE } from 'src/modules/payment/constants';
import { FileService } from 'src/modules/file/services';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';
import { PerformerService } from 'src/modules/performer/services';
import { UserService } from 'src/modules/user/services';
import { UserDto } from 'src/modules/user/dtos';
import { ProductService } from '../services';
import { PRODUCT_TYPE as PERFORMER_PRODUCT_TYPE } from '../constants';

const UPDATE_STOCK_CHANNEL = 'UPDATE_STOCK_CHANNEL';

@Injectable()
export class StockProductListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly productService: ProductService,
    private readonly mailService: MailerService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      UPDATE_STOCK_CHANNEL,
      this.handleStockProducts.bind(this)
    );
  }

  public async handleStockProducts(event: QueueEvent) {
    if (![EVENT.CREATED].includes(event.eventName)) {
      return;
    }
    const { orderDetails, order } = event.data;
    const performer = await this.performerService.findById(order.sellerId);
    const user = await this.userService.findById(order.buyerId);
    const performerProductOrders = orderDetails.filter((o) => o.sellerSource === SELLER_SOURCE.PERFORMER && [PRODUCT_TYPE.DIGITAL_PRODUCT, PRODUCT_TYPE.PHYSICAL_PRODUCT].includes(o.productType));
    if (!performer || !user || !performerProductOrders.length) {
      return;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const orderDetail of performerProductOrders) {
      switch (orderDetail.productType) {
        case PRODUCT_TYPE.PHYSICAL_PRODUCT:
          // eslint-disable-next-line no-await-in-loop
          await this.productService.updateStock(orderDetail.productId, -1 * (orderDetail.quantity || 1));
          break;
        case PRODUCT_TYPE.DIGITAL_PRODUCT:
          // eslint-disable-next-line no-await-in-loop
          await this.sendDigitalProductLink(orderDetail, user, performer);
          break;
        default: break;
      }
    }
  }

  public async sendDigitalProductLink(orderDetail, user, performer) {
    const product = await this.productService.getDetails(orderDetail.productId, new UserDto(user));
    if (!product || product.type !== PERFORMER_PRODUCT_TYPE.DIGITAL || !product.digitalFileId) return;
    const digitalLink = await this.fileService.generateDownloadLink(product.digitalFileId);
    digitalLink && await this.mailService.send({
      subject: `Order #${orderDetail.orderNumber} - Digital file to download`,
      to: user.email,
      data: {
        performer,
        user,
        orderDetail,
        digitalLink,
        totalPrice: orderDetail.totalPrice
      },
      template: 'send-user-digital-product.html'
    });
  }
}
