/* eslint-disable no-nested-ternary */
import {
  Layout, Tabs, Button, message, Modal, Tooltip, Alert
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getVideos, moreVideo } from '@redux/video/actions';
import { getFeeds, moreFeeds, removeFeedSuccess } from '@redux/post/actions';
import { getPerformerStories, moreStories, removeStorySuccess } from '@redux/story/actions';
import { listProducts, moreProduct } from '@redux/product/actions';
import { getBlogs, moreBlogs, removeBlogSuccess } from '@redux/blog/actions';
import { moreGalleries, getGalleries } from '@redux/gallery/actions';
import {
  performerService, paymentService, feedService, reactionService, storyService, blogService, authService
} from 'src/services';
import Head from 'next/head';
import {
  ArrowLeftOutlined, FireOutlined, UsergroupAddOutlined,
  VideoCameraOutlined, PictureOutlined, ShopOutlined, LikeOutlined, MessageOutlined,
  BookOutlined, HistoryOutlined, GlobalOutlined, EditOutlined, GiftOutlined
} from '@ant-design/icons';
import { TickIcon } from 'src/icons';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import ScrollListFeed from '@components/post/scroll-list';
import ScrollListStory from '@components/story/scroll-list';
import { PerformerInfo } from '@components/performer/table-info';
import ScrollListBlog from '@components/blog/scroll-list';
import Link from 'next/link';
import Router from 'next/router';
import Error from 'next/error';
import { TipPerformerForm } from '@components/performer/tip-form';
import { VideoPlayer } from '@components/common/video-player';
import { ConfirmSubscriptionPerformerForm } from '@components/performer';
import { AvatarUpload, CoverUpload } from '@components/user';
import {
  updatePerformer, updateCurrentUserAvatar, updateCurrentUserCover
} from 'src/redux/user/actions';
import SearchPostBar from '@components/post/search-bar';
import {
  IPerformer, IUser, IUIConfig, IFeed, IStory, IBlog
} from 'src/interfaces';
import '@components/performer/performer.less';

interface IProps {
  ui: IUIConfig;
  currentUser: IUser;
  performer: IPerformer;
  listProducts: Function;
  getVideos: Function;
  moreVideo: Function;
  moreProduct: Function;
  videoState: any;
  productState: any;
  getGalleries: Function;
  moreGalleries: Function;
  galleryState: any;
  error: any;
  feedState: any;
  getFeeds: Function;
  moreFeeds: Function;
  removeFeedSuccess: Function;
  storyState: any;
  moreStories: Function;
  getPerformerStories: Function;
  removeStorySuccess: Function;
  blogState: any;
  getBlogs: Function;
  moreBlogs: Function;
  removeBlogSuccess: Function;
  updatePerformer: Function;
  updateCurrentUserAvatar: Function;
  updateCurrentUserCover: Function;
  updatingUser: boolean;
}

const { TabPane } = Tabs;
const initialFilter = {
  q: '',
  fromDate: '',
  toDate: ''
};

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  subscriptionType = 'monthly';

  state = {
    itemPerPage: 12,
    videoPage: 0,
    productPage: 0,
    feedPage: 0,
    blogPage: 0,
    storyPage: 0,
    galleryPage: 0,
    showWelcomVideo: false,
    openTipModal: false,
    submiting: false,
    isBookMarked: false,
    requesting: false,
    openSubscriptionModal: false,
    tab: 'post',
    filter: initialFilter,
    isGrid: false
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    try {
      const performer = (await (
        await performerService.findOne(query.username, {
          Authorization: ctx.token || ''
        })
      ).data) as IPerformer;
      return {
        performer
      };
    } catch (e) {
      const error = await Promise.resolve(e);
      return { error };
    }
  }

  async componentDidMount() {
    const { performer } = this.props;
    if (performer) {
      const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
      const showWelcomVideo = !notShownWelcomeVideos || (notShownWelcomeVideos && !notShownWelcomeVideos.includes(performer._id));
      this.setState({ isBookMarked: performer.isBookMarked || false, showWelcomVideo });
      this.loadItems();
    }
  }

  handleViewWelcomeVideo() {
    const { performer } = this.props;
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (!notShownWelcomeVideos?.includes(performer._id)) {
      const Ids = JSON.parse(notShownWelcomeVideos || '[]');
      const values = Array.isArray(Ids) ? Ids.concat([performer._id]) : [performer._id];
      localStorage.setItem('notShownWelcomeVideos', JSON.stringify(values));
    }
    this.setState({ showWelcomVideo: false });
  }

  async handleDeleteFeed(feed: IFeed) {
    const { removeFeedSuccess: handleRemoveFeed } = this.props;
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted post successfully');
      handleRemoveFeed({ feed });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async handleDeleteBlog(blog: IBlog) {
    const { removeBlogSuccess: handleRemoveBlog } = this.props;
    if (!window.confirm('Are you sure to delete this blog?')) return;
    try {
      await blogService.delete(blog._id);
      message.success('Deleted blog successfully');
      handleRemoveBlog({ blog });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async handleDeleteStory(story: IStory) {
    const { removeStorySuccess: handleRemoveStory } = this.props;
    if (!window.confirm('Are you sure to delete this story ?')) return;
    try {
      await storyService.delete(story._id);
      message.success('Removed story successfully');
      handleRemoveStory({ story });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async handleBookmark() {
    const { performer, currentUser } = this.props;
    const { isBookMarked, requesting } = this.state;
    if (requesting || currentUser.isPerformer) return;
    try {
      await this.setState({ requesting: true });
      if (!isBookMarked) {
        await reactionService.create({
          objectId: performer?._id,
          action: 'book_mark',
          objectType: 'performer'
        });
        this.setState({ isBookMarked: true });
      } else {
        await reactionService.delete({
          objectId: performer?._id,
          action: 'book_mark',
          objectType: 'performer'
        });
        this.setState({ isBookMarked: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ requesting: false });
    }
  }

  async handleFilterSearch(filter) {
    await this.setState({ filter });
    this.loadItems();
  }

  onAvatarUploaded(data: any) {
    const { updateCurrentUserAvatar: handleUpdateAvt } = this.props;
    message.success('Avatar updated');
    handleUpdateAvt(data.response.data.url);
  }

  onCoverUploaded(data: any) {
    const { updateCurrentUserCover: handleUpdateCover } = this.props;
    message.success('Cover image updated');
    handleUpdateCover(data.response.data.url);
  }

  async loadItems() {
    const {
      performer, getGalleries: handleGetGalleries, getVideos: handleGetVids, getFeeds: handleGetFeeds,
      getPerformerStories: handleGetStories, getBlogs: handleGetBlogs, listProducts: handleGetProducts
    } = this.props;
    const {
      itemPerPage, filter, tab
    } = this.state;
    const query = {
      limit: itemPerPage,
      offset: 0,
      performerId: performer._id,
      q: filter.q || '',
      fromDate: filter.fromDate || '',
      toDate: filter.toDate || ''
    };
    switch (tab) {
      case 'post':
        this.setState({ feedPage: 0 }, () => handleGetFeeds(query));
        break;
      case 'photo':
        this.setState({ galleryPage: 0 }, () => handleGetGalleries(query));
        break;
      case 'video':
        this.setState({ videoPage: 0 }, () => handleGetVids(query));
        break;
      case 'story':
        this.setState({ storyPage: 0 }, () => handleGetStories(query));
        break;
      case 'blog':
        this.setState({ blogPage: 0 }, () => handleGetBlogs(query));
        break;
      case 'store':
        this.setState({ productPage: 0 }, () => handleGetProducts(query));
        break;
      default: break;
    }
  }

  async subscribe() {
    const { performer, currentUser } = this.props;
    if (!currentUser.authorisedCard && this.subscriptionType !== 'free') {
      this.authorisedCard();
      return;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await (await paymentService.subscribe({ type: this.subscriptionType, performerId: performer._id })).data;
      if (resp && resp.success) {
        message.success('Subscribed success!', 5);
        window.location.reload();
      }
    } catch (e) {
      this.setState({ submiting: false });
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  async sendTip(price) {
    const { performer, currentUser } = this.props;
    if (!currentUser.authorisedCard) {
      this.authorisedCard();
      return;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.tipPerformer({ performerId: performer?._id, price })
      ).data;
      if (resp.success) {
        message.info('Thank you for the tip');
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async authorisedCard() {
    try {
      if (!window.confirm('By agreeing to add your payment card, you will be charged a minimum price.')) return;
      await this.setState({ submiting: true });
      const resp = await (await paymentService.authoriseCard()).data;
      if (resp && resp.paymentUrl) {
        window.location.href = resp.paymentUrl;
      }
    } catch (e) {
      this.setState({ submiting: false });
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  async loadMoreItem() {
    const {
      feedPage, videoPage, productPage, itemPerPage, storyPage, blogPage, galleryPage, tab, filter
    } = this.state;
    const {
      moreFeeds: getMoreFeed,
      moreVideo: getMoreVids,
      moreProduct: getMoreProd,
      moreStories: getMoreStories,
      moreBlogs: getMoreBlog,
      moreGalleries: getMoreGallery,
      performer
    } = this.props;
    const query = {
      limit: itemPerPage,
      performerId: performer._id,
      q: filter.q || '',
      fromDate: filter.fromDate || '',
      toDate: filter.toDate || ''
    };
    if (tab === 'post') {
      this.setState({
        feedPage: feedPage + 1
      }, () => getMoreFeed({
        ...query,
        offset: feedPage * itemPerPage
      }));
    }
    if (tab === 'blog') {
      this.setState({
        blogPage: blogPage + 1
      }, () => getMoreBlog({
        ...query,
        offset: blogPage * itemPerPage
      }));
    }
    if (tab === 'story') {
      this.setState({
        storyPage: storyPage + 1
      }, () => getMoreStories({
        ...query,
        offset: storyPage * itemPerPage
      }));
    }
    if (tab === 'video') {
      this.setState({
        videoPage: videoPage + 1
      }, () => getMoreVids({
        ...query,
        offset: videoPage * itemPerPage
      }));
    }
    if (tab === 'photo') {
      await this.setState({
        galleryPage: galleryPage + 1
      }, () => {
        getMoreGallery({
          ...query,
          offset: (galleryPage + 1) * itemPerPage
        });
      });
    }
    if (tab === 'store') {
      this.setState({
        productPage: productPage + 1
      }, () => getMoreProd({
        ...query,
        offset: productPage * itemPerPage
      }));
    }
  }

  render() {
    const {
      performer,
      error,
      ui,
      currentUser,
      feedState,
      videoState,
      productState,
      galleryState,
      storyState,
      blogState
    } = this.props;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Not found'} />;
    }
    const { items: feeds = [], total: totalFeed = 0, requesting: loadingFeed } = feedState;
    const { items: stories = [], total: totalStory = 0, requesting: loadingStory } = storyState;
    const { items: blogs = [], total: totalBlog = 0, requesting: loadingBlog } = blogState;
    const { items: videos = [], total: totalVideos = 0, requesting: loadingVideo } = videoState;
    const { items: products = [], total: totalProducts = 0, requesting: loadingPrd } = productState;
    const { items: galleries = [], total: totalGalleries = 0, requesting: loadingGallery } = galleryState;

    const {
      showWelcomVideo,
      openTipModal,
      submiting,
      isBookMarked,
      openSubscriptionModal,
      requesting,
      tab,
      isGrid
    } = this.state;
    const uploadHeaders = { authorization: authService.getToken() };
    const avatarUploadUrl = performerService.getAvatarUploadUrl();
    const coverUploadUrl = performerService.getCoverUploadUrl();
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${performer?.name || performer?.username}`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta name="description" content={performer?.bio} />
          <meta
            property="og:title"
            content={`${ui?.siteName} | ${performer?.name || performer?.username}`}
          />
          <meta property="og:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta
            property="og:description"
            content={performer?.bio}
          />
          <meta
            name="twitter:title"
            content={`${ui?.siteName} | ${performer?.name || performer?.username}`}
          />
          <meta name="twitter:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta name="twitter:description" content={performer?.bio} />
        </Head>
        <div className="main-container pad-0">
          <div
            className="top-profile"
            style={{ backgroundImage: (currentUser._id === performer?._id && `url('${currentUser?.cover || '/static/banner-image.jpg'}')`) || `url('${performer?.cover || '/static/banner-image.jpg'}')` || "url('/static/banner-image.jpg')" }}
          >
            <div className="bg-2nd">
              <div className="main-container">
                <div className="top-banner">
                  <a aria-hidden className="arrow-back" onClick={() => Router.back()}>
                    <ArrowLeftOutlined />
                  </a>
                  <div className="stats-row">
                    <div className="t-user-name">
                      {performer?.name || ''}
                      {' '}
                      {performer?.verifiedAccount && (
                      <TickIcon className="theme-color" />
                      )}
                    </div>
                    <div className="tab-stat">
                      <div className="tab-item">
                        <span>
                          {performer?.stats?.totalFeeds || 0}
                          {' '}
                          <FireOutlined />
                        </span>
                      </div>
                      <div className="tab-item">
                        <span>
                          {performer?.stats?.likes || 0}
                          {' '}
                          <LikeOutlined />
                        </span>
                      </div>
                      <div className="tab-item">
                        <span>
                          {performer?.stats?.subscribers || 0}
                          {' '}
                          <UsergroupAddOutlined />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="main-profile">
          <div className="main-container">
            <div className="fl-col">
              {currentUser._id === performer?._id ? [
                <div key="avatar-upload" className="avatar-upload">
                  <AvatarUpload
                    headers={uploadHeaders}
                    uploadUrl={avatarUploadUrl}
                    onUploaded={this.onAvatarUploaded.bind(this)}
                    image={currentUser.avatar || '/static/no-avatar.png'}
                  />
                </div>,
                <div key="cover-upload" className="cover-upload">
                  <CoverUpload
                    headers={uploadHeaders}
                    uploadUrl={coverUploadUrl}
                    onUploaded={this.onCoverUploaded.bind(this)}
                    image={currentUser?.cover || '/static/banner-image.jpg'}
                    options={{ fieldName: 'cover' }}
                  />
                </div>
              ] : (
                <img
                  alt="main-avt"
                  src={
                      performer && performer?.avatar
                        ? performer?.avatar
                        : '/static/no-avatar.png'
                    }
                />
              )}
              <span className={performer?.isOnline > 0 ? 'online-status' : 'online-status off'} />
              <div className="m-user-name">
                <h4>
                  {performer?.name || 'N/A'}
                    &nbsp;
                  {currentUser._id === performer?._id ? <Link href="/content-creator/account"><a><EditOutlined className="primary-color" /></a></Link> : (
                    <>
                      {performer?.verifiedAccount && (
                      <TickIcon className="theme-color" />
                      )}
                    </>
                  )}
                </h4>
                <h5 style={{ textTransform: 'none' }}>
                  @
                  {performer?.username || 'n/a'}
                </h5>
              </div>
            </div>
            {currentUser._id && !currentUser.isPerformer && (
              <div className="btn-grp">
                <Tooltip title={isBookMarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}>
                  <Button disabled={requesting} className={isBookMarked ? 'normal active' : 'normal'} onClick={this.handleBookmark.bind(this)}>
                    <BookOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="Send Tip">
                  <Button
                    className="normal"
                    onClick={() => this.setState({ openTipModal: true })}
                  >
                    <GiftOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="Message">
                  <Button
                    className="normal"
                    onClick={() => Router.push({
                      pathname: '/messages',
                      query: {
                        toSource: 'performer',
                        toId: performer?._id || ''
                      }
                    })}
                  >
                    <MessageOutlined />
                  </Button>
                </Tooltip>
              </div>
            )}
            <div className={currentUser.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
              <PerformerInfo countries={ui?.countries || []} performer={performer} />
            </div>
            {/* {performer?.streamingStatus === 'public' && performer?.live && (
            <div className="text-center">
              <a>
                <Alert
                  type="info"
                  onClick={() => Router.push(
                    {
                      pathname: '/stream',
                      query: { performer: JSON.stringify(performer) }
                    },
                    `/stream/${performer?.username}`
                  )}
                  message={`${performer?.name || performer?.username} is on broadcasting, click here to join now!`}
                />
              </a>
            </div>
            )} */}
            {performer?.isFreeSubscription && !performer?.isSubscribed && (
            <div className="subscription-bl">
              <h5>Free Subscription</h5>
              <button
                type="button"
                className="sub-btn"
                disabled={submiting && this.subscriptionType === 'free'}
                onClick={() => {
                  this.subscriptionType = 'free';
                  this.setState({ openSubscriptionModal: true });
                }}
              >
                FOLLOW FOR FREE
              </button>
            </div>
            )}
            {!performer?.isFreeSubscription && !performer?.isSubscribed && (
            <div className="subscription-bl">
              <h5>Yearly Subscription</h5>
              <button
                type="button"
                className="sub-btn"
                disabled={submiting && this.subscriptionType === 'yearly'}
                onClick={() => {
                  this.subscriptionType = 'yearly';
                  this.setState({ openSubscriptionModal: true });
                }}
              >
                SUBSCRIBE FOR $
                {performer?.yearlyPrice.toFixed(2)}
              </button>
            </div>
            )}
            {!performer?.isFreeSubscription && !performer?.isSubscribed && (
            <div className="subscription-bl">
              <h5>Monthly Subscription</h5>
              <button
                type="button"
                className="sub-btn"
                disabled={submiting && this.subscriptionType === 'monthly'}
                onClick={() => {
                  this.subscriptionType = 'monthly';
                  this.setState({ openSubscriptionModal: true });
                }}
              >
                SUBSCRIBE FOR $
                {performer && performer?.monthlyPrice.toFixed(2)}
              </button>
            </div>
            )}
            <div className="subscription-bl">
              <h5>Broadcast</h5>
              <button
                type="button"
                className="sub-btn"
                onClick={() => Router.push(
                  {
                    pathname: '/stream',
                    query: { performer: JSON.stringify(performer) }
                  },
                  `/stream/${performer?.username}`
                )}
              >
                VISIT MY LIVE BROADCAST
              </button>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px' }} />
        <div className="main-container pad-0">
          <div className="model-content">
            <Tabs
              activeKey={tab}
              size="large"
              onTabClick={(t: string) => {
                this.setState({ tab: t, filter: initialFilter, isGrid: false }, () => this.loadItems());
              }}
            >
              <TabPane tab={<HistoryOutlined />} key="story">
                <div className="heading-tab">
                  <h4>
                    {totalStory > 0 && totalStory}
                    {' '}
                    STORY
                  </h4>
                  <SearchPostBar searching={loadingStory} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} />
                </div>
                <div className={isGrid ? 'main-container pad-0' : 'main-container custom pad-0'}>
                  <ScrollListStory
                    items={stories}
                    loading={loadingStory}
                    canLoadmore={stories && stories.length < totalStory}
                    loadMore={this.loadMoreItem.bind(this)}
                    onDelete={this.handleDeleteStory.bind(this)}
                  />
                </div>
              </TabPane>
              <TabPane tab={<FireOutlined />} key="post">
                <div className="heading-tab">
                  <h4>
                    {totalFeed > 0 && totalFeed}
                    {' '}
                    POST
                  </h4>
                  <SearchPostBar searching={loadingFeed} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} handleViewGrid={(val) => this.setState({ isGrid: val })} />
                </div>
                <div className={isGrid ? 'main-container pad-0' : 'main-container custom pad-0'}>
                  <ScrollListFeed
                    items={feeds}
                    loading={loadingFeed}
                    canLoadmore={feeds && feeds.length < totalFeed}
                    loadMore={this.loadMoreItem.bind(this)}
                    isGrid={isGrid}
                    onDelete={this.handleDeleteFeed.bind(this)}
                  />
                </div>
              </TabPane>
              <TabPane tab={<VideoCameraOutlined />} key="video">
                <div className="heading-tab">
                  <h4>
                    {totalVideos > 0 && totalVideos}
                    {' '}
                    VIDEO
                  </h4>
                  <SearchPostBar searching={loadingVideo} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} handleViewGrid={(val) => this.setState({ isGrid: val })} />
                </div>
                <div className={isGrid ? 'main-container pad-0' : 'main-container custom pad-0'}>
                  <ScrollListFeed
                    items={videos}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                    isGrid={isGrid}
                    onDelete={this.handleDeleteFeed.bind(this)}
                  />
                </div>
              </TabPane>
              <TabPane tab={<PictureOutlined />} key="photo">
                <div className="heading-tab">
                  <h4>
                    {totalGalleries > 0 && totalGalleries}
                    {' '}
                    GALLERY
                  </h4>
                  <SearchPostBar searching={loadingGallery} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} handleViewGrid={(val) => this.setState({ isGrid: val })} />
                </div>
                <div className={isGrid ? 'main-container pad-0' : 'main-container custom pad-0'}>
                  <ScrollListFeed
                    items={galleries}
                    loading={loadingGallery}
                    canLoadmore={galleries && galleries.length < totalGalleries}
                    loadMore={this.loadMoreItem.bind(this)}
                    onDelete={this.handleDeleteFeed.bind(this)}
                    isGrid={isGrid}
                  />
                </div>
              </TabPane>
              {performer?.isSubscribed && (
              <TabPane tab={<GlobalOutlined />} key="blog">
                <div className="heading-tab">
                  <h4>
                    {totalBlog > 0 && totalBlog}
                    {' '}
                    BLOG
                  </h4>
                  <SearchPostBar searching={loadingBlog} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} />
                </div>
                <ScrollListBlog
                  items={blogs}
                  loading={loadingBlog}
                  canLoadmore={blogs && blogs.length < totalBlog}
                  loadMore={this.loadMoreItem.bind(this)}
                  onDelete={this.handleDeleteBlog.bind(this)}
                />
              </TabPane>
              )}
              <TabPane tab={<ShopOutlined />} key="store">
                <div className="heading-tab">
                  <h4>
                    {totalProducts > 0 && totalProducts}
                    {' '}
                    PRODUCT
                  </h4>
                  <SearchPostBar searching={loadingPrd} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} />
                </div>
                <ScrollListProduct
                  items={products}
                  loading={loadingPrd}
                  canLoadmore={products && products.length < totalProducts}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
        {performer
          && performer?.welcomeVideoPath
          && performer?.activateWelcomeVideo && (
            <Modal
              key="welcome-video"
              destroyOnClose
              width={768}
              visible={showWelcomVideo}
              title={null}
              onCancel={() => this.setState({ showWelcomVideo: false })}
              footer={[
                <Button
                  key="close"
                  className="secondary"
                  onClick={() => this.setState({ showWelcomVideo: false })}
                >
                  Close
                </Button>,
                <Button
                  key="not-show"
                  className="primary"
                  onClick={this.handleViewWelcomeVideo.bind(this)}
                >
                  Don&apos;t show me again
                </Button>
              ]}
            >
              <VideoPlayer
                key={performer?._id}
                {...{
                  autoplay: true,
                  controls: true,
                  playsinline: true,
                  fluid: true,
                  sources: [
                    {
                      src: performer?.welcomeVideoPath,
                      type: 'video/mp4'
                    }
                  ]
                }}
              />
            </Modal>
        )}
        <Modal
          key="tip_performer"
          className="subscription-modal"
          visible={openTipModal}
          onOk={() => this.setState({ openTipModal: false })}
          footer={null}
          width={350}
          title={null}
          onCancel={() => this.setState({ openTipModal: false })}
        >
          <TipPerformerForm
            user={currentUser}
            performer={performer}
            submiting={submiting}
            onFinish={this.sendTip.bind(this)}
          />
        </Modal>
        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={350}
          title={null}
          visible={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            user={currentUser}
            type={this.subscriptionType || 'monthly'}
            performer={performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
          />
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  videoState: { ...state.video.videos },
  feedState: { ...state.feed.feeds },
  storyState: { ...state.story.stories },
  productState: { ...state.product.products },
  galleryState: { ...state.gallery.listGalleries },
  currentUser: { ...state.user.current },
  updatingUser: state.user.updating,
  blogState: { ...state.blog.blogs }
});

const mapDispatch = {
  moreStories,
  getPerformerStories,
  getFeeds,
  moreFeeds,
  getBlogs,
  moreBlogs,
  getVideos,
  moreVideo,
  listProducts,
  moreProduct,
  getGalleries,
  moreGalleries,
  removeFeedSuccess,
  removeStorySuccess,
  removeBlogSuccess,
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};
export default connect(mapStates, mapDispatch)(PerformerProfile);
