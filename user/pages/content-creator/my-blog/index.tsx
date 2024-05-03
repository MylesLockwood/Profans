import Head from 'next/head';
import { PureComponent } from 'react';
import {
  message, Layout, Row, Col
} from 'antd';
import { blogService } from '@services/index';
import { SearchFilter } from '@components/common/search-filter';
import Page from '@components/common/layout/page';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IUIConfig, IUser } from '@interfaces/index';
import ScrollListBlog from '@components/blog/scroll-list';

import { PlusCircleOutlined } from '@ant-design/icons';

interface IProps {
  ui: IUIConfig;
  user: IUser;
}

class BlogListing extends PureComponent<IProps> {
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
      const resp = await blogService.search({
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

  async deleteBlog(blog) {
    const { list } = this.state;
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return false;
    }
    try {
      await blogService.delete(blog._id);
      const newList = list.filter((f) => f._id !== blog._id);
      await this.setState({ list: newList });
      message.success('Deleted blog successfully!');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
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
            | My Blogs
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div
              className="page-heading"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>My Blogs</span>
              <Link href="/content-creator/my-blog/create">
                <a>
                  {' '}
                  <PlusCircleOutlined />
                  {' '}
                  New Blog
                </a>
              </Link>
            </div>
            <div />
            <div>
              <Row>
                <Col xl={16}>
                  <SearchFilter searchWithKeyword onSubmit={this.handleFilter.bind(this)} />
                </Col>
              </Row>
            </div>

            <div className="main-container">
              <ScrollListBlog
                items={list}
                loading={loading}
                canLoadmore={canLoadMore}
                loadMore={this.loadMore.bind(this)}
                onDelete={this.deleteBlog.bind(this)}
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
export default connect(mapStates)(BlogListing);
