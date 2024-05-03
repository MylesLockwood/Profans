import * as React from 'react';
import { Layout, Drawer, BackTop } from 'antd';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { connect } from 'react-redux';
import { updateUIValue, loadUIValue } from 'src/redux/ui/actions';
import Sider from '@components/common/layout/sider';
import { IUIConfig } from 'src/interfaces/ui-config';
import {
  PieChartOutlined,
  ContainerOutlined,
  UserOutlined,
  WomanOutlined,
  BlockOutlined,
  FileImageOutlined,
  SkinOutlined,
  DollarOutlined,
  HeartOutlined,
  MenuOutlined,
  FireOutlined
} from '@ant-design/icons';
import Header from '@components/common/layout/header';
import { Router } from 'next/router';
import Loader from '@components/common/base/loader';
import './primary-layout.less';

interface DefaultProps extends IUIConfig {
  children: any;
  config: IUIConfig;
  updateUIValue: Function;
  loadUIValue: Function;
}

class PrimaryLayout extends React.PureComponent<DefaultProps> {
  state = {
    isMobile: false,
    routerChange: false
  };

  enquireHandler: any;

  componentDidMount() {
    const { loadUIValue: handleLoadUI } = this.props;
    handleLoadUI();
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile
        });
      }
    });

    process.browser && this.handleStateChange();
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  handleStateChange() {
    Router.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    Router.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  onCollapseChange = (collapsed) => {
    const { updateUIValue: handleUpdateUI } = this.props;
    handleUpdateUI({ collapsed });
  };

  onThemeChange = (theme: string) => {
    const { updateUIValue: handleUpdateUI } = this.props;
    handleUpdateUI({ theme });
  };

  render() {
    const {
      children, collapsed, fixedHeader, logo, siteName, theme
    } = this.props;
    const { isMobile, routerChange } = this.state;
    const headerProps = {
      collapsed,
      theme,
      onCollapseChange: this.onCollapseChange
    };

    const sliderMenus = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: <PieChartOutlined />,
        children: [
          {
            id: 'statistic',
            name: 'Statistic',
            route: '/'
          }
        ]
      },
      {
        id: 'blockCountry',
        name: 'Blacklist Country',
        icon: <BlockOutlined />,
        children: [
          {
            id: 'listing',
            name: 'Listing',
            route: '/block-country'
          }
        ]
      },
      {
        id: 'posts',
        name: 'Static Pages',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'post-page',
            name: 'Listing',
            route: '/posts?type=page'
          },
          {
            id: 'page-create',
            name: 'Create new',
            route: '/posts/create?type=page'
          }
        ]
      },
      {
        id: 'menu',
        name: 'FE Menu',
        icon: <MenuOutlined />,
        children: [
          {
            id: 'menu-listing',
            name: 'Listing',
            route: '/menu'
          },
          {
            name: 'Create new',
            id: 'create-menu',
            route: '/menu/create'
          }
        ]
      },
      {
        id: 'coupon',
        name: 'Coupons',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'coupon-listing',
            name: 'Listing',
            route: '/coupon'
          },
          {
            name: 'Create new',
            id: 'create-coupon',
            route: '/coupon/create'
          }
        ]
      },
      {
        id: 'banner',
        name: 'Banners',
        icon: <FileImageOutlined />,
        children: [
          {
            id: 'banner-listing',
            name: 'Listing',
            route: '/banner'
          },
          {
            name: 'Upload new',
            id: 'upload-banner',
            route: '/banner/upload'
          }
        ]
      },
      {
        id: 'accounts',
        name: 'Users',
        icon: <UserOutlined />,
        children: [
          {
            name: 'Listing',
            id: 'users',
            route: '/users'
          },
          {
            name: 'Create new',
            id: 'users-create',
            route: '/users/create'
          }
        ]
      },
      {
        id: 'performers',
        name: 'Content Creators',
        icon: <WomanOutlined />,
        children: [
          // {
          //   name: 'Categories',
          //   id: 'performer-categories',
          //   route: '/content-creator/category'
          // },
          {
            name: 'Listing',
            id: 'performer-listing',
            route: '/content-creator'
          },
          {
            name: 'Create new',
            id: 'create-performers',
            route: '/content-creator/create'
          }
        ]
      },
      {
        id: 'trending-profiles',
        name: 'Trending Profiles',
        icon: <WomanOutlined />,
        children: [
          {
            name: 'Trending Profiles',
            id: 'trending-performers',
            route: '/content-creator/trending'
          },
          {
            name: 'Newest Profiles',
            id: 'newest-performers',
            route: '/content-creator/newest'
          }
        ]
      },
      {
        id: 'feeds',
        name: 'Posts',
        icon: <FireOutlined />,
        children: [
          {
            id: 'feed-listing',
            name: 'All Posts',
            route: '/feed'
          },
          {
            id: 'video_posts',
            name: 'Video Posts',
            route: '/feed?type=video'
          },
          {
            id: 'photo_posts',
            name: 'Photo Posts',
            route: '/feed?type=photo'
          },
          {
            id: 'create_post',
            name: 'Create New',
            route: '/feed/create'
          }
        ]
      },
      {
        id: 'performers-products',
        name: 'Products',
        icon: <SkinOutlined />,
        children: [
          {
            id: 'product-listing',
            name: 'Products',
            route: '/product'
          },
          {
            name: 'Create',
            id: 'create-product',
            route: '/product/create'
          }
        ]
      },
      {
        id: 'payments',
        name: 'Transactions',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'payment',
            name: 'Listing',
            route: '/payment'
          }
        ]
      },
      {
        id: 'order',
        name: 'Orders',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'order-listing',
            name: 'Listing',
            route: '/order'
          }
        ]
      },
      {
        id: 'referral-program',
        name: 'Referral Program',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'earning-referral',
            name: 'Referral Earnings',
            route: '/referral-program/earning'
          },
          {
            id: 'payout-requests',
            name: 'Payout Requests',
            route: '/referral-program/payout-request'
          },
          {
            id: 'reports',
            name: 'Referral Records',
            route: '/referral-program/record'
          }
        ]
      },
      {
        id: 'earning',
        name: 'Earnings',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'earning-listing',
            name: 'Listing',
            route: '/earning'
          }
        ]
      },
      {
        id: 'subscription',
        name: 'Subscriptions',
        icon: <HeartOutlined />,
        children: [
          {
            name: 'Listing',
            id: 'subscription-listing',
            route: '/subscription'
          },
          {
            name: 'Create new',
            id: 'create-subscription',
            route: '/subscription/create'
          }
        ]
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: <PieChartOutlined />,
        children: [
          {
            id: 'system-settings',
            route: '/settings',
            as: '/settings',
            name: 'Settings'
          }
        ]
      }
    ];
    const siderProps = {
      collapsed,
      isMobile,
      logo,
      siteName,
      theme,
      menus: sliderMenus,
      onCollapseChange: this.onCollapseChange,
      onThemeChange: this.onThemeChange
    };

    return (
      <>
        <Layout>
          {isMobile ? (
            <Drawer
              maskClosable
              closable={false}
              onClose={this.onCollapseChange.bind(this, !collapsed)}
              visible={!collapsed}
              placement="left"
              width={257}
              style={{
                padding: 0,
                height: '100vh'
              }}
            >
              <Sider {...siderProps} />
            </Drawer>
          ) : (
            <Sider {...siderProps} />
          )}
          <div className="container" style={{ paddingTop: fixedHeader ? 72 : 0 }} id="primaryLayout">
            <Header {...headerProps} />
            <Layout.Content className="content" style={{ position: 'relative' }}>
              {routerChange && <Loader />}
              {/* <Bread routeList={newRouteList} /> */}
              {children}
            </Layout.Content>
            <BackTop className="backTop" target={() => document.querySelector('#primaryLayout') as any} />
          </div>
        </Layout>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ...state.ui,
  auth: state.auth
});
const mapDispatchToProps = { updateUIValue, loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);
