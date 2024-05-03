import Head from 'next/head';
import { PureComponent } from 'react';
import {
  message, Layout
} from 'antd';
import { storyService } from '@services/index';
import { SearchFilter } from '@components/common/search-filter';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import { IPerformer, IUIConfig } from '@interfaces/index';
import ScrollListStory from '@components/story/scroll-list';
import Link from 'next/link';
import { PlusCircleOutlined } from '@ant-design/icons';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
}

class StoryListing extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    canLoadMore: false,
    list: [] as any,
    limit: 10,
    currentPage: 1,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc',
    loading: false
  };

  componentDidMount() {
    this.search(1);
  }

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    const {
      filter, limit, sortBy, sort
    } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await storyService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        list: resp.data.data,
        currentPage: page,
        canLoadMore: resp.data.total > resp.data.data * page
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ loading: false });
    }
  }

  async loadMore() {
    const { currentPage } = this.state;
    await this.setState({ currentPage: currentPage + 1 });
    this.search(currentPage);
  }

  async deleteStory(blog) {
    const { list } = this.state;
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    try {
      await storyService.delete(blog._id);
      const newList = list.filter((f) => f._id !== blog._id);
      await this.setState({ list: newList });
      message.success('Deleted story successfully!');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { list, loading, canLoadMore } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui?.siteName}
            {' '}
            | My Stories
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>My Stories</span>
              <Link href="/content-creator/my-story/create">
                <a>
                  {' '}
                  <PlusCircleOutlined />
                  {' '}
                  New Story
                </a>
              </Link>
            </div>
            <div>
              <SearchFilter searchWithKeyword dateRange onSubmit={this.handleFilter.bind(this)} />
            </div>
            <div className="main-container custom">
              <ScrollListStory
                items={list}
                loading={loading}
                canLoadmore={canLoadMore}
                loadMore={this.loadMore.bind(this)}
                onDelete={this.deleteStory.bind(this)}
              />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(StoryListing);
