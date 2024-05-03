import { Layout, message, Tabs } from 'antd';
import { PureComponent } from 'react';
import Page from '@components/common/layout/page';
import {
  IUIConfig,
  IFeed,
  IUser
} from 'src/interfaces';
import { connect } from 'react-redux';
import {
  feedService,
  productService,
  performerService
} from 'src/services';
import Head from 'next/head';
import UserFeedBookmarks from '@components/user/bookmarks/post-bookmarks';
import UserPerformerBookmarks from '@components/user/bookmarks/performer-bookmarks';
import UserProductBookmarks from '@components/user/bookmarks/product-bookmarks';

interface IProps {
  ui: IUIConfig;
  user: IUser;
}
interface IStates {
  loading: boolean;
  feeds: any[];
  totalFeeds: number;
  currentPage: {
    feed: number;
    gallery: number;
    performer: number;
    video: number;
    product: number;
  };
  limit: number;
  videos: any[];
  totalVideos: number;
  galleries: any[];
  totalGalleries: number;
  performers: any[];
  totalPerformers: number;
  products: any[];
  totalProducts: number;
  tab: string;
}

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
      feeds: [],
      totalFeeds: 0,
      currentPage: {
        feed: 0,
        gallery: 0,
        performer: 0,
        video: 0,
        product: 0
      },
      limit: 12,
      videos: [],
      totalVideos: 0,
      galleries: [],
      totalGalleries: 0,
      performers: [],
      totalPerformers: 0,
      products: [],
      totalProducts: 0,
      tab: 'feeds'
    };
  }

  componentDidMount() {
    this.getBookmarkedPosts();
  }

  async handlePagechange(
    key: 'feeds' | 'videos' | 'galleries' | 'products' | 'performers'
  ) {
    const { currentPage } = this.state;
    this.setState({
      currentPage: { ...currentPage, [key]: currentPage[key] + 1 }
    });

    if (key === 'feeds') {
      this.getBookmarkedPosts();
    }
    if (key === 'videos') {
      this.getBookmarkedVideos();
    }
    if (key === 'galleries') {
      this.getBookmarkedGalleries();
    }
    if (key === 'products') {
      this.getBookmarkedProducts();
    }
    if (key === 'performers') {
      this.getBookmarkedPerformers();
    }
  }

  onTabsChange(key: string) {
    this.loadData(key);
    this.setState({ tab: key });
  }

  async onDeleteFeed(feed: IFeed) {
    const { user } = this.props;
    const { feeds } = this.state;
    if (user._id !== feed.fromSourceId) {
      return message.error('Permission denied');
    }
    if (!window.confirm('Are you sure to delete this post?')) return undefined;
    try {
      await feedService.delete(feed._id);
      feeds.filter((f) => f._id !== feed._id);
      message.success('Removed successfully');
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Something went wrong, please try again later');
    }
    return undefined;
  }

  async getBookmarkedPosts() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        limit,
        offset: currentPage.feed * limit
      });
      this.setState({
        feeds: resp.data.data,
        totalFeeds: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedVideos() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        type: 'video',
        limit,
        offset: currentPage.video * limit
      });
      this.setState({
        videos: resp.data.data,
        totalVideos: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedGalleries() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        type: 'photo',
        limit,
        offset: currentPage.gallery * limit
      });
      this.setState({
        galleries: resp.data.data,
        totalGalleries: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedProducts() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await productService.getBookmarked({
        limit,
        offset: currentPage.product * limit
      });
      this.setState({
        products: resp.data.data,
        totalProducts: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async getBookmarkedPerformers() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await performerService.getBookmarked({
        limit,
        offset: currentPage.performer * limit
      });

      this.setState({
        performers: resp.data.data,
        totalPerformers: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async loadData(key: string) {
    if (key === 'feeds' || undefined) {
      await this.getBookmarkedPosts();
    }
    if (key === 'videos') {
      await this.getBookmarkedVideos();
    }
    if (key === 'galleries') {
      await this.getBookmarkedGalleries();
    }
    if (key === 'products') {
      await this.getBookmarkedProducts();
    }
    if (key === 'performers') {
      await this.getBookmarkedPerformers();
    }
  }

  render() {
    const {
      loading,
      feeds,
      totalFeeds,
      videos,
      totalVideos,
      galleries,
      totalGalleries,
      performers,
      totalPerformers,
      products,
      totalProducts,
      tab
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Bookmarks
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading">Bookmarks</div>
          <div className="main-container">
            <Page>
              <Tabs
                defaultActiveKey={tab || 'feeds'}
                style={{ padding: '0 24px' }}
                size="large"
                onChange={this.onTabsChange.bind(this)}
              >
                <Tabs.TabPane tab="All Posts" key="feeds">
                  <div className="main-container custom">
                    <UserFeedBookmarks
                      items={feeds.map((f) => f.objectInfo)}
                      total={totalFeeds}
                      loading={loading}
                      onDeleteFeed={this.onDeleteFeed.bind(this)}
                      loadMore={this.handlePagechange.bind(this, 'feeds')}
                    />
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Video Posts" key="videos">
                  <div className="main-container custom">
                    <UserFeedBookmarks
                      items={videos.map((f) => f.objectInfo)}
                      total={totalVideos}
                      loading={loading}
                      onDeleteFeed={this.onDeleteFeed.bind(this)}
                      loadMore={this.handlePagechange.bind(this, 'videos')}
                    />
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Photo Posts" key="galleries">
                  <div className="main-container custom">
                    <UserFeedBookmarks
                      items={galleries.map((f) => f.objectInfo)}
                      total={totalGalleries}
                      loading={loading}
                      onDeleteFeed={this.onDeleteFeed.bind(this)}
                      loadMore={this.handlePagechange.bind(this, 'galleries')}
                    />
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Products" key="products">
                  <UserProductBookmarks
                    loading={loading}
                    products={products.map((p) => p.objectInfo)}
                    total={totalProducts}
                    loadMore={this.handlePagechange.bind(
                      this,
                      'products'
                    )}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Content Creators" key="performers">
                  <UserPerformerBookmarks
                    loading={loading}
                    performers={performers.map((p) => p.objectInfo)}
                    total={totalPerformers}
                    loadMore={this.handlePagechange.bind(
                      this,
                      'performers'
                    )}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Page>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapState = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});
export default connect(mapState)(FavouriteVideoPage);
