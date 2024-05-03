import { PureComponent } from 'react';
import {
  Layout, Row, Col, Button, message, Input, Space
} from 'antd';

import { connect } from 'react-redux';
import Head from 'next/head';
import { TableCart } from '@components/cart/table-cart';
import { updateItemCart, removeCart } from 'src/redux/cart/actions';
import { paymentService, productService, cartService } from 'src/services';
import _ from 'lodash';
import Router from 'next/router';
import {
  IProduct, IUser, IUIConfig, ICoupon
} from '../../src/interfaces';
import './cart.less';

interface IProps {
  cart: any;
  updateItemCart: Function;
  removeCart: Function;
  user: IUser;
  ui: IUIConfig;
}

function mapQuantiy(items, existCart) {
  existCart.forEach((item) => {
    const index = items.findIndex((element) => element._id === item._id);
    // eslint-disable-next-line no-param-reassign
    if (index > -1) items[index].quantity = item.quantity;
  });
  return items;
}

class CartPage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  state = {
    products: [],
    couponCode: '',
    isApplyCoupon: false,
    coupon: null as ICoupon,
    deliveryAddress: '',
    requesting: false
  };

  async componentDidMount() {
    const { user } = this.props;
    if (user) {
      const existCart = await cartService.getCartByUser(user._id);
      if (existCart && existCart.length > 0) {
        const itemIds = existCart.map((i) => i._id);
        const resp = await productService.userSearch({
          includedIds: itemIds
        });
        if (resp.data && resp.data.data && resp.data.data.length > 0) {
          const products = mapQuantiy(resp.data.data, existCart);
          await this.setState({
            products
          });
        }
      }
    }
  }

  async onChangeQuantity(item, quantity) {
    const { updateItemCart: updateItemCartHandler } = this.props;
    const { products } = this.state;
    updateItemCartHandler({ data: item, quantity });
    this.updateCartLocalStorage(item, quantity);
    const index = products.findIndex((element) => element._id === item._id);
    if (index > -1) {
      const newArray = [...products];
      newArray[index] = {
        ...newArray[index],
        quantity: quantity || 1
      };
      await this.setState({ products: newArray });
    }
  }

  async onRemove(item) {
    const { removeCart: removeCartHandler } = this.props;
    const { products } = this.state;
    removeCartHandler([item]);
    this.removeItemCart(item);
    const index = products.findIndex((element) => element._id === item._id);
    if (index > -1) {
      let newArray = [...products];
      newArray = newArray.filter(
        (product: IProduct) => product._id !== item._id
      );
      await this.setState({ products: newArray });
    }
  }

  removeItemCart(product: IProduct) {
    const { user } = this.props;
    let oldCart = localStorage.getItem(`cart_${user._id}`) as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    let newCart = [...oldCart];
    newCart = newCart.filter((item: IProduct) => item._id !== product._id);
    localStorage.setItem(`cart_${user._id}`, JSON.stringify(newCart));
  }

  updateCartLocalStorage(item: IProduct, quantity: number) {
    const { user } = this.props;
    let oldCart = localStorage.getItem(`cart_${user._id}`) as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    const index = oldCart.findIndex((element) => element._id === item._id);
    const newCart = [...oldCart];
    if (index > -1) {
      newCart[index] = {
        ...newCart[index],
        quantity: quantity || 1
      };
    }
    localStorage.setItem(
      `cart_${user._id}`,
      JSON.stringify(_.uniqBy(newCart, '_id'))
    );
  }

  async purchaseProducts() {
    try {
      const { cart } = this.props;
      const {
        deliveryAddress, isApplyCoupon, couponCode, products: prods
      } = this.state;
      const { items } = cart;
      await this.setState({ requesting: true });
      if (items && items.length > 0) {
        if (!deliveryAddress && prods.filter((p) => p.type === 'physical').length) {
          message.error('Please enter your delivery address');
          return;
        }
        const products = items.map((item) => ({
          quantity: item.quantity || 1,
          _id: item._id
        }));
        const data = isApplyCoupon && couponCode
          ? {
            products,
            couponCode,
            deliveryAddress
          }
          : { products, deliveryAddress };
        // TODO redirect to payment url
        const payment = await (await paymentService.purchaseProducts(data))
          .data;
        if (payment) {
          message.success('Redirecting to payment method');
          window.location.reload();
          // window.location.href = payment.paymentUrl;
        }
      }
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : 'Error occured, please try again later'
      );
      Router.push('/payment/cancel');
    } finally {
      this.setState({ requesting: false });
    }
  }

  async applyCoupon() {
    try {
      const { couponCode } = this.state;
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({ isApplyCoupon: true, coupon: resp.data });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : 'Error occured, please try again later'
      );
    }
  }

  async unApplyCoupon() {
    this.setState({ isApplyCoupon: false, coupon: null });
  }

  render() {
    const { ui } = this.props;
    const {
      products, isApplyCoupon, coupon, couponCode, requesting
    } = this.state;
    const calTotal = (items, couponValue?: number) => {
      let total = 0;
      items?.length
        && items.forEach((item) => {
          total += (item.quantity || 1) * item.price;
        });
      if (couponValue) {
        total -= total * couponValue;
      }
      return total.toFixed(2) || 0;
    };

    const mustHaveDeliveryAddress = products.filter((p) => p.type === 'physical').length > 0;

    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Cart
          </title>
        </Head>
        <Layout>
          <div className="main-container" style={{ padding: '40px 0' }}>
            {/* <div className="page-heading">Cart</div> */}
            {products && products.length > 0 && (
            <div className="table-responsive">
              <TableCart
                dataSource={products}
                rowKey="_id"
                onChangeQuantity={this.onChangeQuantity.bind(this)}
                onRemoveItemCart={this.onRemove.bind(this)}
              />
            </div>
            )}
            {products && products.length > 0 && (
            <Row
              style={{
                marginTop: '30px',
                background: '#f8f9fa',
                padding: '10px',
                lineHeight: '2.5rem',
                borderRadius: '0.5em'
              }}
              justify="end"
              className="cart-form"
            >
              {mustHaveDeliveryAddress && (
              <Col span={24}>
                <Input
                  placeholder="Enter your shipping address"
                  onChange={(e) => this.setState({
                    deliveryAddress: e.currentTarget.value
                  })}
                />
              </Col>
              )}
              <Col xs={12} md={16} lg={18}>
                <Input
                  placeholder="Enter a coupon code"
                  onChange={(value) => this.setState({ couponCode: value.currentTarget.value })}
                  disabled={isApplyCoupon}
                />
              </Col>
              <Col xs={12} md={8} lg={6}>
                {!isApplyCoupon ? (
                  <Button
                    style={{ width: '100%' }}
                    disabled={!couponCode}
                    className="primary"
                    onClick={() => this.applyCoupon()}
                  >
                    <strong>Apply coupon!</strong>
                  </Button>
                ) : (
                  <Button
                    style={{ width: '100%' }}
                    className="primary"
                    onClick={() => this.unApplyCoupon()}
                  >
                    <strong>Use coupon later</strong>
                  </Button>
                )}
              </Col>
              <Col span={24}>
                <strong style={{ fontSize: '20px' }}>Total price</strong>
                :
                {' '}
                <Space>
                  <span className={isApplyCoupon ? 'discount-price' : 'initialPrice'}>
                    $
                    {calTotal(products || [])}
                  </span>
                  {isApplyCoupon && coupon && (
                  <span>
                    $
                    {calTotal(products || [], coupon.value)}
                  </span>
                  )}
                </Space>
              </Col>
              <Col span={24}>
                <Button
                  className="secondary"
                  onClick={() => this.purchaseProducts()}
                  disabled={requesting}
                  loading={requesting}
                >
                  <strong>Checkout</strong>
                </Button>
              </Col>
            </Row>
            )}
            {!products.length && (
            <p className="text-center">
              You have an empty cart, let&apos;s go shopping
            </p>
            )}
          </div>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  cart: state.cart,
  user: state.user.current,
  ui: state.ui
});

const mapDispatch = { updateItemCart, removeCart };
export default connect(mapStates, mapDispatch)(CartPage);
