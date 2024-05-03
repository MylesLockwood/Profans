import { PureComponent } from 'react';
import {
  message, Select, Layout
} from 'antd';
import {
  HistoryOutlined, GlobalOutlined, FireOutlined, SearchOutlined, ShoppingCartOutlined
} from '@ant-design/icons';
import { ModelIcon } from 'src/icons';
import {
  performerService, productService, feedService, blogService, storyService, searchService
} from '@services/index';
import Head from 'next/head';
import { connect } from 'react-redux';
import { ScrollListPerformer } from '@components/performer/scroll-list';
import ScrollListFeed from '@components/post/scroll-list';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import ScrollListBlog from '@components/blog/scroll-list';
import ScrollListStory from '@components/story/scroll-list';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import {
  IUIConfig, IFeed, IUser, IStory, IBlog
} from '@interfaces/index';
import './index.less';

interface IProps {
  totalPerformer: number;
  totalProduct: number;
  totalFeed: number;
  totalStory: number;
  totalBlog: number;
  ui: IUIConfig;
  currentUser: IUser;
  q: string;
  categoryId: string;
}

const initialState = {
  type: 'feed',
  searching: false,
  limit: 12,
  performers: {
    data: [],
    total: 0,
    offset: 0
  },
  blogs: {
    data: [],
    total: 0,
    offset: 0
  },
  products: {
    data: [],
    total: 0,
    offset: 0
  },
  stories: {
    data: [],
    total: 0,
    offset: 0
  },
  feeds: {
    data: [],
    total: 0,
    offset: 0
  },
  filter: { sortBy: 'popular' }
};

class PageSearch extends PureComponent<IProps> {
  static authenticate = true;

  static async getInitialProps({ ctx }) {
    const { q = '' } = ctx.query;
    const resp = await searchService.searchByKeyword({ keyword: q });
    return {
      ...ctx.query,
      ...resp.data
    };
  }

  state = { ...initialState }

  async componentDidMount() {
    const {
      totalPerformer, totalProduct, totalFeed, totalBlog, totalStory
    } = this.props;
    if (totalFeed) {
      this.searchFeed();
    }
    if (!totalFeed && totalPerformer) {
      this.setState({ type: 'performer' });
      this.searchPerformer();
    }
    if (!totalFeed && !totalPerformer && totalStory) {
      this.setState({ type: 'story' });
      this.searchStory();
    }
    if (!totalFeed && !totalPerformer && !totalStory && totalProduct) {
      this.setState({ type: 'product' });
      this.searchProduct();
    }
    if (!totalFeed && !totalPerformer && !totalStory && !totalProduct && totalBlog) {
      this.setState({ type: 'blog' });
      this.searchBlog();
    }
    // this.getCategories();
  }

  async componentDidUpdate(prevProps) {
    const { q } = this.props;
    if (prevProps.q !== q) {
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({ ...initialState });
      this.searchFeed();
    }
  }

  async handleFilterPerformer(values: any) {
    const { filter, performers } = this.state;
    await this.setState({ performers: { ...performers, offset: 0 }, filter: { ...filter, ...values } });
    this.searchPerformer();
  }

  async handleDeleteFeed(feed: IFeed) {
    const { feeds } = this.state;
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      this.setState({ feeds: { ...feeds, data: feeds.data.filter((f) => f._id !== feed._id) } });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async handleDeleteStory(story: IStory) {
    const { stories } = this.state;
    if (!window.confirm('Are you sure to delete this story?')) return;
    try {
      await storyService.delete(story._id);
      message.success('Deleted the story successfully');
      this.setState({ feeds: { ...stories, data: stories.data.filter((s) => s._id !== story._id) } });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async handleDeleteBlog(blog: IBlog) {
    const { blogs } = this.state;
    if (!window.confirm('Are you sure to delete this blog?')) return;
    try {
      await blogService.delete(blog._id);
      message.success('Deleted the blog successfully');
      this.setState({ blogs: { ...blogs, data: blogs.data.filter((b) => b._id !== blog._id) } });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  async onLoadMore() {
    const {
      type, performers, feeds, stories, blogs, products
    } = this.state;
    switch (type) {
      case 'performer':
        this.setState({ performers: { ...performers, offset: performers.offset + 1 } }, () => this.searchPerformer());
        break;
      case 'feed':
        this.setState({ feeds: { ...feeds, offset: feeds.offset + 1 } }, () => this.searchFeed());
        break;
      case 'story':
        this.setState({ stories: { ...stories, offset: stories.offset + 1 } }, () => this.searchStory());
        break;
      case 'blog':
        this.setState({ blogs: { ...blogs, offset: blogs.offset + 1 } }, () => this.searchBlog());
        break;
      case 'product':
        this.setState({ products: { ...products, offset: products.offset + 1 } }, () => this.searchProduct());
        break;
      default: break;
    }
  }

  async searchPerformer() {
    const { q } = this.props;
    const { performers, limit, filter } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await performerService.search({
        q,
        limit,
        offset: performers.offset * limit,
        ...filter
      })).data;
      this.setState({ performers: { ...performers, total: resp.total, data: performers.data.concat(resp.data) }, searching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ searching: false });
    }
  }

  async searchStory() {
    const { q } = this.props;
    const { stories, limit } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await storyService.userSearch({
        q,
        limit,
        offset: stories.offset * limit
      })).data;
      this.setState({ stories: { ...stories, total: resp.total, data: stories.data.concat(resp.data) }, searching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ searching: false });
    }
  }

  async searchBlog() {
    const { q } = this.props;
    const { blogs, limit } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await blogService.userSearch({
        q,
        limit,
        offset: blogs.offset * limit
      })).data;
      this.setState({ blogs: { ...blogs, total: resp.total, data: blogs.data.concat(resp.data) }, searching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ searching: false });
    }
  }

  async searchProduct() {
    const { q } = this.props;
    const { products, limit } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await productService.userSearch({
        q,
        limit,
        offset: products.offset * limit
      })).data;
      this.setState({ products: { ...products, total: resp.total, data: resp.data }, searching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ searching: false });
    }
  }

  async searchFeed() {
    const { q } = this.props;
    const { feeds, limit } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await feedService.userSearch({
        q,
        limit,
        offset: feeds.offset * limit
      })).data;
      this.setState({ feeds: { ...feeds, total: resp.total, data: feeds.data.concat(resp.data) }, searching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ searching: false });
    }
  }

  async typeChanged(type) {
    const {
      performers, feeds, stories, products, blogs
    } = this.state;
    await this.setState({ ...initialState, type });
    if (type === 'feed') {
      await this.setState({ feeds: { ...feeds, offset: 0 } });
      this.searchFeed();
    }
    if (type === 'story') {
      await this.setState({ stories: { ...stories, offset: 0 } });
      this.searchStory();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: 0 } });
      this.searchProduct();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: 0 } });
      this.searchPerformer();
    }
    if (type === 'blog') {
      await this.setState({ blogs: { ...blogs, offset: 0 } });
      this.searchBlog();
    }
    // this.getCategories();
  }

  render() {
    const {
      ui, q, totalBlog, totalFeed, totalPerformer, totalProduct, totalStory
    } = this.props;
    const {
      performers, blogs, stories, products, feeds, type, searching
    } = this.state;
    const totalResult = totalPerformer + totalFeed + totalStory + totalProduct + totalBlog;

    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | Search`}
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading" style={{ justifyContent: 'space-between', display: 'flex' }}>
            <span className="box">
              <SearchOutlined />
              {' '}
              {q && `'${q}'`}
              {' '}
              {totalResult}
              {' '}
              results
            </span>
            <Select className="drop-search" value={type} onSelect={this.typeChanged.bind(this)}>
              <Select.Option value="feed">
                <FireOutlined />
                &nbsp;
                Post (
                {feeds.total || totalFeed}
                )
              </Select.Option>
              <Select.Option value="blog">
                <GlobalOutlined />
                &nbsp;
                Blog (
                {blogs.total || totalBlog}
                )
              </Select.Option>
              <Select.Option value="story">
                <HistoryOutlined />
                &nbsp;
                Story (
                {stories.total || totalStory}
                )
              </Select.Option>
              <Select.Option value="performer">
                <ModelIcon />
                &nbsp;
                Creator (
                {performers.total || totalPerformer}
                )
              </Select.Option>
              <Select.Option value="product">
                <ShoppingCartOutlined />
                &nbsp;
                Product (
                {products.total || totalProduct}
                )
              </Select.Option>
            </Select>
          </div>
          {type === 'feed' && (
            <>
              <div className="heading-tab">
                <h4>
                  {feeds.total || totalFeed}
                  {' '}
                  POST
                </h4>
              </div>
              <div className="main-container custom">
                <ScrollListFeed items={feeds.data} canLoadmore={feeds.total > feeds.data.length} loadMore={this.onLoadMore.bind(this)} loading={searching} onDelete={this.handleDeleteFeed.bind(this)} />
              </div>
            </>
          )}
          {type === 'story' && (
            <>
              <div className="heading-tab">
                <h4>
                  {stories.total || totalStory}
                  {' '}
                  STORY
                </h4>
              </div>
              <div className="main-container custom">
                <ScrollListStory onDelete={this.handleDeleteStory.bind(this)} items={stories.data} canLoadmore={stories.total > stories.data.length} loadMore={this.onLoadMore.bind(this)} loading={searching} />
              </div>
            </>
          )}
          {type === 'blog' && (
            <>
              <div className="heading-tab">
                <h4>
                  {blogs.total || totalBlog}
                  {' '}
                  BLOG
                </h4>
              </div>
              <div className="main-container custom">
                <ScrollListBlog onDelete={this.handleDeleteBlog.bind(this)} items={blogs.data} canLoadmore={blogs.total > blogs.data.length} loadMore={this.onLoadMore.bind(this)} loading={searching} />
              </div>
            </>
          )}
          {type === 'performer' && (
          <>
            <div className="heading-tab">
              <h4>
                {performers.total || totalPerformer}
                {' '}
                CREATOR
              </h4>
            </div>
            <PerformerAdvancedFilter
              defaultValue={null}
              onSubmit={this.handleFilterPerformer.bind(this)}
              countries={ui?.countries || []}
            />
            <ScrollListPerformer canLoadmore={performers.total > performers.data.length} items={performers.data} loadMore={this.onLoadMore.bind.bind(this)} loading={searching} />
          </>
          )}
          {type === 'product' && (
          <>
            <div className="heading-tab">
              <h4>
                {products.total || totalProduct}
                {' '}
                PRODUCT
              </h4>
            </div>
            <ScrollListProduct items={products.data} canLoadmore={products.total > products.data.length} loadMore={this.onLoadMore.bind(this)} loading={searching} />
          </>
          )}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current }
});
const mapDispatch = {
};

export default connect(mapStates, mapDispatch)(PageSearch);
