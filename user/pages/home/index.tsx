/* eslint-disable no-console */
import {
  Layout, message, Tooltip, Button, Alert
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import { HomePerformers } from '@components/performer';
import { TrendingProfilesBanner } from '@components/common/trending-profiles-banner';
import { getBanners } from '@redux/banner/actions';
import { getFeeds, moreFeeds, removeFeedSuccess } from '@redux/post/actions';
import { performerService, feedService } from '@services/index';
import {
  IFeed, IPerformer, ISetting, IUIConfig, IUser
} from 'src/interfaces';
import ScrollListFeed from '@components/post/scroll-list';
import {
  SyncOutlined, TagOutlined, FilterOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import './index.less';

interface IProps {
  ui: IUIConfig;
  settings: ISetting;
  user: IUser;
  bannerState: any;
  getBanners: Function;
  performers: IPerformer[];
  getFeeds: Function;
  moreFeeds: Function;
  feedState: any;
  removeFeedSuccess: Function;
}

class HomePage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    itemPerPage: 12,
    feedPage: 0,
    loadingPerformer: false,
    loadingTrendingPerformer: false,
    isFreeSubscription: '',
    orientation: '',
    trendingPerformers: [],
    newestPerformers: []
  }

  componentDidMount() {
    const { getFeeds: handleGetFeeds, user } = this.props;
    const { itemPerPage, feedPage } = this.state;
    // this.getBanners();
    this.getPerformers();
    this.getTrendingPerformers();
    handleGetFeeds({
      limit: itemPerPage,
      offset: feedPage,
      isHome: !!user.verifiedEmail
    });
  }

  async onGetFreePerformers() {
    const { isFreeSubscription } = this.state;
    await this.setState({ isFreeSubscription: isFreeSubscription ? '' : true });
    this.getPerformers();
  }

  async onDeleteFeed(feed: IFeed) {
    const { user, removeFeedSuccess: handleRemoveFeed } = this.props;
    if (user._id !== feed.fromSourceId) {
      message.error('Permission denied');
      return;
    }
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Removed post successfully');
      handleRemoveFeed({ feed });
    } catch (e) {
      message.error('Something went wrong, please try again later');
    }
  }

  async onFilterFeed(value: string) {
    const { getFeeds: handleGetFeeds, user } = this.props;
    await this.setState({ orientation: value, feedPage: 0 });
    const { itemPerPage, orientation } = this.state;
    handleGetFeeds({
      limit: itemPerPage,
      offset: 0,
      isHome: !!user.verifiedEmail,
      orientation
    });
  }

  getBanners() {
    const { getBanners: handleGetBanners } = this.props;
    handleGetBanners({ status: 'active' });
  }

  async getPerformers() {
    const { isFreeSubscription } = this.state;
    try {
      await this.setState({ loadingPerformer: true });
      const performers = await (
        await performerService.randomTrendingProfiles({ listType: 'newest', isFreeSubscription })
      ).data.data;
      this.setState({ newestPerformers: performers });
    } catch (e) {
      console.log('err_load_newest', await e);
    } finally {
      this.setState({ loadingPerformer: false });
    }
  }

  async getTrendingPerformers() {
    try {
      await this.setState({ loadingTrendingPerformer: true });
      const performers = await (
        await performerService.trendingProfiles({ listType: 'subscription' })
      ).data.data;
      this.setState({ trendingPerformers: performers });
    } catch (e) {
      console.log('err_load_trending', await e);
    } finally {
      this.setState({ loadingTrendingPerformer: false });
    }
  }

  async loadmoreFeeds() {
    const { feedState, moreFeeds: handleGetMore, user } = this.props;
    const { items: posts, total: totalFeeds } = feedState;
    const { feedPage, itemPerPage } = this.state;
    if (posts.length >= totalFeeds) return;
    this.setState({ feedPage: feedPage + 1 }, () => {
      handleGetMore({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage,
        isHome: !!user.verifiedEmail
      });
    });
  }

  render() {
    const {
      ui, feedState, user, settings
    } = this.props;
    // const { items: banners } = bannerState;
    const { items: feeds, total: totalFeeds, requesting: loadingFeed } = feedState;
    // const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');
    // const leftBanners = banners && banners.length > 0 && banners.filter(b => b.position === 'left')
    // const rightBanners = banners && banners.length > 0 && banners.filter(b => b.position === 'right')
    // const middleBanners = banners && banners.length > 0 && banners.filter(b => b.position === 'middle')
    // const bottomBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'bottom');
    const {
      newestPerformers, loadingPerformer, isFreeSubscription,
      orientation, loadingTrendingPerformer, trendingPerformers
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Home
          </title>
        </Head>
        <div className="home-page">
          <TrendingProfilesBanner items={trendingPerformers} loading={loadingTrendingPerformer} />
          <div style={{ position: 'relative' }}>
            {/* <div className="banner-left">
                  {leftBanners && leftBanners.length > 0 && <Banner banners={leftBanners} />}
                </div>
                <div className="banner-right">
                  {rightBanners && rightBanners.length > 0 && <Banner banners={rightBanners} />}
                </div> */}
            <div className="main-container pad-0">
              <div className="home-container">
                <div className="left-container">
                  {user._id && !user.verifiedEmail && settings.requireEmailVerification && <Link href={user.isPerformer ? '/content-creator/account' : '/user/account'}><a><Alert type="error" style={{ margin: '15px 0', textAlign: 'center' }} message="Please verify your email address, click here to update!" /></a></Link>}
                  <div className="filter-feed">
                    <FilterOutlined />
                    <Button disabled={loadingFeed} className={orientation === '' ? 'active' : ''} onClick={() => this.onFilterFeed('')}>All</Button>
                    <Button disabled={loadingFeed} className={orientation === 'female' ? 'active' : ''} onClick={() => this.onFilterFeed('female')}>Female</Button>
                    <Button disabled={loadingFeed} className={orientation === 'male' ? 'active' : ''} onClick={() => this.onFilterFeed('male')}>Male</Button>
                    <Button disabled={loadingFeed} className={orientation === 'transgender' ? 'active' : ''} onClick={() => this.onFilterFeed('transgender')}>Trans</Button>
                    <Button disabled={loadingFeed} className={orientation === 'couple' ? 'active' : ''} onClick={() => this.onFilterFeed('couple')}>Couples</Button>
                  </div>
                  <ScrollListFeed
                    items={feeds}
                    canLoadmore={feeds && feeds.length < totalFeeds}
                    loading={loadingFeed}
                    onDelete={this.onDeleteFeed.bind(this)}
                    loadMore={this.loadmoreFeeds.bind(this)}
                  />
                </div>
                <div className="right-container">
                  <div className="suggestion-bl">
                    <div className="sug-top">
                      <span className="sug-text">NEWEST</span>
                      <span className="btns-grp" style={{ textAlign: newestPerformers.length < 6 ? 'right' : 'left' }}>
                        <a aria-hidden className="free-btn" onClick={this.onGetFreePerformers.bind(this)}><Tooltip title={isFreeSubscription ? 'Show all' : 'Show only free'}><TagOutlined className={isFreeSubscription ? 'active' : ''} /></Tooltip></a>
                        <a aria-hidden className="reload-btn" onClick={this.getPerformers.bind(this)}><Tooltip title="Refresh"><SyncOutlined spin={loadingPerformer} /></Tooltip></a>
                      </span>
                    </div>
                    {!loadingPerformer && newestPerformers && newestPerformers.length > 0 && (
                    <HomePerformers performers={newestPerformers} />
                    )}
                    {!loadingPerformer && !newestPerformers?.length && <p className="text-center">No profile was found.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* {middleBanners && middleBanners.length > 0 && (
                <Banner banners={middleBanners} />
              )}
              {bottomBanners && bottomBanners.length > 0 && (
                <Banner banners={bottomBanners} />
              )} */}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  user: { ...state.user.current },
  feedState: { ...state.feed.feeds }
});

const mapDispatch = {
  getBanners, getFeeds, moreFeeds, removeFeedSuccess
};
export default connect(mapStates, mapDispatch)(HomePage);
