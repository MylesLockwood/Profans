import { PureComponent } from 'react';
import {
  Layout, Avatar, Badge, message, Drawer, Divider, Switch
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import { IUIConfig, IUser, StreamSettings } from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  ShoppingCartOutlined, UserOutlined, UsergroupDeleteOutlined, HeartOutlined, BulbOutlined, EditOutlined,
  GlobalOutlined, FireOutlined, DollarOutlined, HistoryOutlined, StarOutlined, ShoppingOutlined,
  LogoutOutlined, SearchOutlined, LinkOutlined, UsergroupAddOutlined, VideoCameraAddOutlined
} from '@ant-design/icons';
import {
  HomeIcon, ModelIcon, PlusIcon, MessageIcon, UserIcon
} from 'src/icons';
import { withRouter, Router as RouterEvent } from 'next/router';
import { addCart } from 'src/redux/cart/actions';
import {
  cartService, messageService, authService, streamService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { PrivateCallCard } from '@components/streaming/private-call-request-card';
import { updateUIValue } from 'src/redux/ui/actions';
import SearchBar from './search-bar';
import './header.less';

interface IProps {
  updateUIValue: Function;
  currentUser: IUser;
  logout: Function;
  router: any;
  ui: IUIConfig;
  cart: any;
  privateRequests: any;
  addCart: Function;
  addPrivateRequest: Function;
  accessPrivateRequest: Function;
  settings: StreamSettings;
}

class Header extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    openSearch: false,
    openProfile: false,
    openCallRequest: false
  };

  async componentDidMount() {
    if (process.browser) {
      const { cart, currentUser, addCart: handleAddCart } = this.props;
      RouterEvent.events.on(
        'routeChangeStart',
        async () => this.setState({
          openProfile: false, openSearch: false, openCallRequest: false
        })
      );
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            handleAddCart(existCart);
          }
        }
      }
    }
  }

  async componentDidUpdate(prevProps: any) {
    const { currentUser, cart, addCart: handleAddCart } = this.props;
    if (prevProps.currentUser._id !== currentUser._id && currentUser._id) {
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id && process.browser) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            handleAddCart(existCart);
          }
        }
      }
      this.handleCountNotificationMessage();
    }
  }

  componentWillUnmount() {
    RouterEvent.events.off(
      'routeChangeStart',
      async () => this.setState({
        openProfile: false, openSearch: false, openCallRequest: false
      })
    );
  }

  async handleCountNotificationMessage() {
    const data = await (await messageService.countTotalNotRead()).data;
    if (data) {
      this.setState({ totalNotReadMessage: data.total });
    }
  }

  handleMessage = async (event) => {
    event && this.setState({ totalNotReadMessage: event.total });
  };

  handlePrivateChat(data: { conversationId: string; user: IUser }) {
    const { addPrivateRequest: _addPrivateRequest } = this.props;
    message.success(`${data?.user?.name || data?.user?.username}'ve sent you a private call request`, 10);
    _addPrivateRequest({ ...data });
    this.setState({ openCallRequest: true });
  }

  async handleDeclineCall(conversationId: string) {
    const { accessPrivateRequest: handleRemoveRequest } = this.props;
    try {
      await streamService.declinePrivateChat(conversationId);
      handleRemoveRequest(conversationId);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  onThemeChange = (theme: string) => {
    const { updateUIValue: handleUpdateUI } = this.props;
    handleUpdateUI({ theme });
  };

  async beforeLogout() {
    const { logout: handleLogout } = this.props;
    const token = authService.getToken();
    const socket = this.context;
    token && socket && await socket.emit('auth/logout', {
      token
    });
    socket && socket.close();
    handleLogout();
  }

  render() {
    const {
      currentUser, router, ui, cart, privateRequests, settings
    } = this.props;
    const {
      totalNotReadMessage, openSearch, openProfile, openCallRequest
    } = this.state;

    return (
      <div className="main-header">
        <Event
          event="nofify_read_messages_in_conversation"
          handler={this.handleMessage.bind(this)}
        />
        <Event
          event="private-chat-request"
          handler={this.handlePrivateChat.bind(this)}
        />
        <div className="main-container pad-0">
          <Layout.Header className="header" id="layoutHeader">
            <div className="nav-bar">
              <ul className={currentUser._id ? 'nav-icons' : 'nav-icons custom'}>
                {currentUser._id && (
                  <li className={router.pathname === '/home' ? 'active' : ''}>
                    <Link href="/home">
                      <a>
                        <HomeIcon />
                      </a>
                    </Link>
                  </li>
                )}
                {currentUser && currentUser._id && currentUser.isPerformer && (
                  <>
                    <li className={router.pathname === '/content-creator/my-post/create' ? 'active' : ''}>
                      <Link href="/content-creator/my-post/create">
                        <a title="Compose new post">
                          <PlusIcon />
                        </a>
                      </Link>
                    </li>
                    <li className={router.pathname === '/content-creator/live' ? 'active' : ''}>
                      <Link href="/content-creator/live" as="/content-creator/live">
                        <a title="Go Live">
                          <VideoCameraAddOutlined />
                        </a>
                      </Link>
                    </li>
                    <li className={router.pathname === '/content-creator/my-story/create' ? 'active' : ''}>
                      <Link href="/content-creator/my-story/create">
                        <a title="Add a story">
                          <HistoryOutlined />
                        </a>
                      </Link>
                    </li>
                  </>
                )}
                {currentUser && currentUser._id && !currentUser.isPerformer && [
                  <li key="models" className={router.pathname === '/content-creator' ? 'active' : ''}>
                    <Link href="/content-creator">
                      <a title="Content creators">
                        <ModelIcon />
                      </a>
                    </Link>
                  </li>,
                  <li key="cart" className={router.pathname === '/cart' ? 'active' : ''}>
                    <Link href="/cart">
                      <a title="Cart">
                        <ShoppingCartOutlined />
                        <Badge
                          className="cart-total"
                          count={cart.total}
                          showZero
                          overflowCount={9}
                        />
                      </a>
                    </Link>
                  </li>
                ]}
                {currentUser._id && currentUser.isPerformer && (
                  <li
                    onClick={() => this.setState({ openCallRequest: true })}
                    aria-hidden
                    key="private_call"
                    className={router.pathname === `/content-creator/live/${settings.optionForPrivate === 'webrtc'
                      ? 'webrtc/'
                      : ''
                    }privatechat` ? 'active' : ''}
                  >
                    <a title="Private chat requests">
                      <UsergroupAddOutlined />
                      <Badge className="cart-total" showZero overflowCount={9} count={privateRequests.length} />
                    </a>
                  </li>
                )}
                {currentUser._id && (
                  <>
                    <li key="messenger" className={router.pathname === '/messages' ? 'active' : ''}>
                      <Link href="/messages">
                        <a title="Messenger">
                          <MessageIcon />
                          <Badge
                            overflowCount={9}
                            className="cart-total"
                            count={totalNotReadMessage}
                            showZero
                          />
                        </a>
                      </Link>
                    </li>
                    <li key="search" aria-hidden onClick={() => this.setState({ openSearch: !openSearch })}>
                      <a className="search-mobile"><SearchOutlined /></a>
                    </li>
                  </>
                )}
                {!currentUser._id && [
                  <li key="logo" className="logo-nav">
                    <Link href="/">
                      <a>{ui.logo ? <img src={ui.logo} alt="logo" /> : `${ui.siteName}`}</a>
                    </Link>
                  </li>,
                  <li key="login" className={router.pathname === '/' ? 'active' : ''}>
                    <Link href="/">
                      <a>Login</a>
                    </Link>
                  </li>,
                  <li key="signup" className={router.pathname === '/auth/register' ? 'active' : ''}>
                    <Link href="/auth/register">
                      <a>Sign Up</a>
                    </Link>
                  </li>
                ]}
                {currentUser._id && (
                  <li key="avatar" aria-hidden onClick={() => this.setState({ openProfile: true })}>
                    <Avatar src={currentUser?.avatar || '/static/no-avatar.png'} />
                  </li>
                )}
              </ul>
            </div>
          </Layout.Header>
          <Drawer
            title="Private Call Requests"
            closable
            onClose={() => this.setState({ openCallRequest: false })}
            visible={openCallRequest}
            key="private-call-drawer"
            className={ui.theme === 'light' ? 'profile-drawer' : 'profile-drawer dark'}
            width={300}
          >
            {privateRequests.length > 0 ? privateRequests.map((request) => (
              <PrivateCallCard key={request.conversationId} request={request} settings={settings} onDecline={this.handleDeclineCall.bind(this)} />
            )) : <p className="text-center">No Call Request</p>}
          </Drawer>
          <Drawer
            title={(
              <>
                <SearchOutlined />
                {' '}
                Search Content Creators
              </>
            )}
            closable
            onClose={() => this.setState({ openSearch: false })}
            visible={openSearch}
            key="search-drawer"
            className={ui.theme === 'light' ? 'profile-drawer' : 'profile-drawer dark'}
            width={450}
          >
            <SearchBar ui={ui} />
          </Drawer>
          <Drawer
            title={(
              <div className="profile-user">
                <img src={currentUser?.avatar || '/static/no-avatar.png'} alt="logo" />
                <a className="profile-name">
                  {currentUser?.name || 'N/A'}
                  <span>
                    @
                    {currentUser?.username || 'n/a'}
                  </span>
                </a>
              </div>
            )}
            closable
            onClose={() => this.setState({ openProfile: false })}
            visible={openProfile}
            key="profile-drawer"
            className={ui.theme === 'light' ? 'profile-drawer' : 'profile-drawer dark'}
            width={280}
          >
            {currentUser.isPerformer && (
              <div className="profile-menu-item">
                <Link href={{ pathname: '/content-creator/profile', query: { username: currentUser.username || currentUser._id } }} as={`/${currentUser.username || currentUser._id}`}>
                  <div className={router.pathname === '/content-creator/profile' ? 'menu-item active' : 'menu-item'}>
                    <UserIcon />
                    {' '}
                    My Profile
                  </div>
                </Link>
                <Link href="/content-creator/account" as="/content-creator/account">
                  <div className={router.pathname === '/content-creator/account' ? 'menu-item active' : 'menu-item'}>
                    <EditOutlined />
                    {' '}
                    Edit Profile
                  </div>
                </Link>
                <Link href={{ pathname: '/search/analytics' }} as="/search/analytics">
                  <div className={router.pathname === '/search/analytics' ? 'menu-item active' : 'menu-item'}>
                    <SearchOutlined />
                    {' '}
                    Keywords
                  </div>
                </Link>
                <Link href={{ pathname: '/content-creator/my-subscriber' }} as="/content-creator/my-subscriber">
                  <div className={router.pathname === '/content-creator/my-subscriber' ? 'menu-item active' : 'menu-item'}>
                    <StarOutlined />
                    {' '}
                    Subscribers
                  </div>
                </Link>
                <Link href={{ pathname: '/content-creator/restrict-user' }} as="/content-creator/restrict-user">
                  <div className={router.pathname === '/content-creator/restrict-user' ? 'menu-item active' : 'menu-item'}>
                    <UsergroupDeleteOutlined />
                    {' '}
                    Restricted Users
                  </div>
                </Link>
                <Link href={{ pathname: '/referral-program' }} as="/referral-program">
                  <div className={router.pathname === '/referral-program' ? 'menu-item active' : 'menu-item'}>
                    <LinkOutlined />
                    {' '}
                    Referral Program
                  </div>
                </Link>
                <Divider />
                <Link href="/content-creator/my-post" as="/content-creator/my-post">
                  <div className={router.pathname === '/content-creator/my-post' ? 'menu-item active' : 'menu-item'}>
                    <FireOutlined />
                    {' '}
                    Posts
                  </div>
                </Link>
                <Link href="/content-creator/my-story" as="/content-creator/my-story">
                  <div className={router.pathname === '/content-creator/my-story' ? 'menu-item active' : 'menu-item'}>
                    <HistoryOutlined />
                    {' '}
                    Stories
                  </div>
                </Link>
                <Link href="/content-creator/my-blog" as="/content-creator/my-blog">
                  <div className={router.pathname === '/content-creator/my-blog' ? 'menu-item active' : 'menu-item'}>
                    <GlobalOutlined />
                    {' '}
                    Blogs
                  </div>
                </Link>
                <Link href="/content-creator/my-store" as="/content-creator/my-store">
                  <div className={router.pathname === '/content-creator/my-store' ? 'menu-item active' : 'menu-item'}>
                    <ShoppingOutlined />
                    {' '}
                    Store
                  </div>
                </Link>
                <Divider />
                <Link href={{ pathname: '/content-creator/my-order' }} as="/content-creator/my-order">
                  <div className={router.pathname === '/content-creator/my-order' ? 'menu-item active' : 'menu-item'}>
                    <ShoppingCartOutlined />
                    {' '}
                    Orders
                  </div>
                </Link>
                <Link href="/content-creator/earning" as="/content-creator/earning">
                  <div className={router.pathname === '/content-creator/earning' ? 'menu-item active' : 'menu-item'}>
                    <DollarOutlined />
                    {' '}
                    Earnings
                  </div>
                </Link>
                <Divider />
                <div aria-hidden className="menu-item" onClick={() => this.beforeLogout()}>
                  <LogoutOutlined />
                  {' '}
                  Sign Out
                </div>
              </div>
            )}
            {!currentUser.isPerformer && (
              <div className="profile-menu-item">
                <Link href="/user/account" as="/user/account">
                  <div className={router.pathname === '/user/account' ? 'menu-item active' : 'menu-item'}>
                    <UserOutlined />
                    {' '}
                    Edit Profile
                  </div>
                </Link>
                <Link href={{ pathname: '/referral-program' }} as="/referral-program">
                  <div className={router.pathname === '/referral-program' ? 'menu-item active' : 'menu-item'}>
                    <LinkOutlined />
                    {' '}
                    Referral Program
                  </div>
                </Link>
                <Divider />
                <Link href="/user/bookmarks" as="/user/bookmarks">
                  <div className={router.pathname === '/content-creator/account' ? 'menu-item active' : 'menu-item'}>
                    <StarOutlined />
                    {' '}
                    Bookmarks
                  </div>
                </Link>
                <Link href="/user/my-subscription" as="/user/my-subscription">
                  <div className={router.pathname === '/user/my-subscription' ? 'menu-item active' : 'menu-item'}>
                    <HeartOutlined />
                    {' '}
                    Subscriptions
                  </div>
                </Link>
                <Link href="/user/orders" as="/user/orders">
                  <div className={router.pathname === '/user/orders' ? 'menu-item active' : 'menu-item'}>
                    <ShoppingCartOutlined />
                    {' '}
                    Orders
                  </div>
                </Link>
                <Link href="/user/payment-history" as="/user/payment-history">
                  <div className={router.pathname === '/user/payment-history' ? 'menu-item active' : 'menu-item'}>
                    <DollarOutlined />
                    {' '}
                    Transactions
                  </div>
                </Link>
                <Divider />
                <div className="menu-item" aria-hidden onClick={() => this.beforeLogout()}>
                  <LogoutOutlined />
                  {' '}
                  Sign Out
                </div>
              </div>
            )}
            <div className="switchTheme">
              <span>
                <BulbOutlined />
                <span>Switch Theme</span>
              </span>
              <Switch
                onChange={this.onThemeChange.bind(this, ui.theme === 'dark' ? 'light' : 'dark')}
                checked={ui.theme === 'dark'}
                checkedChildren="Dark"
                unCheckedChildren="Light"
              />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

Header.contextType = SocketContext;
const mapState = (state: any) => ({
  currentUser: { ...state.user.current },
  ui: { ...state.ui },
  cart: { ...state.cart },
  ...state.streaming
});
const mapDispatch = {
  logout, addCart, addPrivateRequest, accessPrivateRequest, updateUIValue
};
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
