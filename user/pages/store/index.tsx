import {
  Layout, Button, message, Modal, Alert, Spin
} from 'antd';
import { ShoppingCartOutlined, ShopOutlined, BookOutlined } from '@ant-design/icons';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import { productService, reactionService } from '@services/index';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { addCart, removeCart } from '@redux/cart/actions';
import Link from 'next/link';
import _ from 'lodash';
import { IProduct, IUser, IUIConfig } from '../../src/interfaces';
import './store.less';

interface IProps {
  addCart: Function;
  cart: any;
  user: IUser;
  removeCart: Function;
  ui: IUIConfig;
  id: string;
}

interface IStoreProps {
  visible: boolean;
  onOk: any;
  onCancel: any;
}

interface IStates {
  isAlreadyBookMarked: boolean;
  product: IProduct;
  relatedProducts: IProduct[];
  modalVisible: boolean;
  currentItem: IProduct;
  loading: boolean;
}

const ConfirmChangeCart = ({ visible, onOk, onCancel }: IStoreProps) => (
  <div>
    <Modal
      title="Confirm to switch cart"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Alert
        message="You are ordering product of another content creator, please confirm that you want to switch cart."
        type="warning"
      />
    </Modal>
  </div>
);

class ProductViewPage extends PureComponent<IProps, IStates> {
  static authenticate: boolean = true;

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      product: null,
      relatedProducts: [],
      modalVisible: false,
      currentItem: null,
      loading: false,
      isAlreadyBookMarked: false
    };
  }

  async componentDidMount() {
    await this.getProduct();
  }

  async componentDidUpdate(prevProps) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.getProduct();
    }
  }

  async handleBookmark(item: IProduct) {
    const { isAlreadyBookMarked } = this.state;
    try {
      await this.setState({ loading: true });
      if (!isAlreadyBookMarked) {
        await reactionService.create({
          objectId: item._id,
          action: 'book_mark',
          objectType: 'product'
        });
        this.setState({ isAlreadyBookMarked: true });
      } else {
        await reactionService.delete({
          objectId: item._id,
          action: 'book_mark',
          objectType: 'product'
        });
        this.setState({ isAlreadyBookMarked: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ loading: false });
    }
  }

  async onAddCart(item: IProduct) {
    await this.setState({ currentItem: item });
    const productOf = localStorage.getItem('product_of') as any;
    const { cart, addCart: handleAddCart } = this.props;
    if (cart && cart.items.length > 0 && productOf !== item.performerId) {
      await this.setState({ modalVisible: true });
      return;
    }
    localStorage.setItem('product_of', item.performerId);
    const index = cart.items.findIndex((element) => element._id === item._id);
    if (index > -1) {
      message.error('Product is added to cart');
      return;
    }
    handleAddCart([{ _id: item._id, quantity: 1 }]);
    message.success('Product is added to cart');
    this.updateCartLocalStorage({ _id: item._id, quantity: 1 });
  }

  async onConfirmChangeCart() {
    const { currentItem } = this.state;
    const { removeCart: handleRemoveCart, cart } = this.props;
    localStorage.setItem('product_of', currentItem.performerId);
    await handleRemoveCart(cart.items);
    await this.resetCartLocal();
    this.onAddCart(currentItem);
    this.setState({ modalVisible: false });
  }

  onCancelChangeCart() {
    this.setState({
      modalVisible: false
    });
  }

  async getProduct() {
    const { id } = this.props;
    try {
      await this.setState({ loading: true });
      const product = (await (await productService.userView(id))
        .data) as IProduct;
      if (product) {
        await this.setState({ product });
        if (product.isBookMarked) {
          await this.setState({ isAlreadyBookMarked: true });
        }
        const relatedProducts = await (await productService.userSearch({
          limit: 24,
          excludedId: product._id,
          performerId: product.performerId
        })
        ).data;
        this.setState({
          relatedProducts: relatedProducts.data
        });
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ loading: false });
    }
  }

  updateCartLocalStorage(item: IProduct) {
    const { user } = this.props;
    let oldCart = localStorage.getItem(`cart_${user._id}`) as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    const newCart = [...oldCart, ...[item]];
    localStorage.setItem(
      `cart_${user._id}`,
      JSON.stringify(_.uniqBy(newCart, '_id'))
    );
  }

  resetCartLocal() {
    const { user } = this.props;
    localStorage.setItem(`cart_${user._id}`, JSON.stringify([]));
  }

  render() {
    const { user, ui } = this.props;
    const {
      modalVisible,
      product,
      relatedProducts,
      isAlreadyBookMarked,
      loading
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            |
            {' '}
            {product && product.name}
          </title>
        </Head>
        <div className="prod-main">
          <div className="main-container">
            <div className="prod-card">
              <ConfirmChangeCart
                visible={modalVisible}
                onOk={this.onConfirmChangeCart.bind(this)}
                onCancel={this.onCancelChangeCart.bind(this)}
              />
              {product && (
              <div className="prod-img">
                <img
                  alt="product-img"
                  src={
                          product.image ? product.image : '/static/empty_product.svg'
                        }
                />
                {product.stock && product.type === 'physical' && (
                <span className="prod-stock">
                  {product.stock}
                  {' '}
                  in stock
                </span>
                )}
                {!product.stock && product.type === 'physical' && (
                <span className="prod-stock">Out of stock!</span>
                )}
                <span className="prod-digital">{product.type}</span>
              </div>
              )}
              {product && (
              <div className="prod-info">
                <div className="prod-name">{product?.name}</div>
                <p className="prod-desc">{product?.description}</p>
                <div className="add-cart">
                  <p className="prod-price">
                    $
                    {product.price.toFixed(2)}
                  </p>
                  <Button
                    className="primary"
                    disabled={(product.stock < 1 && product.type === 'physical') || user.isPerformer}
                    onClick={this.onAddCart.bind(this, product)}
                  >
                    <ShoppingCartOutlined />
                    {' '}
                    Add to Cart
                  </Button>
                  &nbsp;
                  {!user.isPerformer && (
                  <Button type="link" className="secondary">
                    <Link href="/cart">
                      <a>
                        <ShopOutlined />
                        {' '}
                        Go to Cart
                      </a>
                    </Link>
                  </Button>
                  )}
                  &nbsp;
                  {!user.isPerformer && (
                  <Button
                    className={isAlreadyBookMarked ? 'primary' : 'secondary'}
                    disabled={loading}
                    onClick={this.handleBookmark.bind(this, product)}
                  >
                    <BookOutlined />
                    {isAlreadyBookMarked
                      ? 'Remove from Bookmark'
                      : 'Add to Bookmark'}
                  </Button>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
        <div className="main-container">
          <div className="related-prod">
            <h4 className="ttl-1">You may also like</h4>
            {!loading && relatedProducts.length > 0 && (
            <PerformerListProduct products={relatedProducts} />
            )}
            {!loading && !relatedProducts.length && <p>No data was found</p>}
            {loading && <div style={{ margin: 10, textAlign: 'center' }}><Spin /></div>}
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  cart: { ...state.cart },
  user: state.user.current,
  ui: { ...state.ui }
});

const mapDispatch = { addCart, removeCart };
export default connect(mapStates, mapDispatch)(ProductViewPage);
