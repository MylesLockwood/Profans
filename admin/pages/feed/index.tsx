/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-nested-ternary */
import Head from 'next/head';
import { PureComponent } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { feedService } from '@services/feed.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListFeed } from '@components/feed/table-list';
import { BreadcrumbComponent } from '@components/common';
import { withRouter } from 'next/router';

interface IProps {
  router: any;
  performerId?: string;
}

class Feeds extends PureComponent<IProps> {
  type = '';

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { performerId, router } = this.props;
    const { filter } = this.state;
    await this.setState({ filter: { type: router?.query?.type || '' } });
    if (performerId) {
      await this.setState({ filter: { ...filter, fromSourceId: performerId } });
    }
    this.search();
  }

  async componentDidUpdate(prevProps) {
    const { performerId, router } = this.props;
    if (prevProps.router.query.type !== router.query.type) {
      const { filter } = this.state;
      await this.setState({ filter: { type: router?.query?.type || '' } });
      if (performerId) {
        await this.setState({ filter: { ...filter, fromSourceId: performerId } });
      }
      this.search();
    }
  }

  handleTableChange = (pagi, filters, sorter) => {
    const { pagination } = this.state;
    const pager = { ...pagination };
    pager.current = pagi.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    const {
      filter, limit, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await feedService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy

      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async deleteFeed(id: string) {
    const { pagination } = this.state;
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await feedService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { performerId } = this.props;
    const type = !this.type ? [
      { key: '', text: 'All Posts' },
      { key: 'video', text: 'Video Posts' },
      { key: 'photo', text: 'Photo Posts' },
      { key: 'text', text: 'Text Posts' }
    ] : [];

    return (
      <>
        <Head>
          <title>Posts</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Posts' }]} />
        <Page>
          <SearchFilter
            onSubmit={this.handleFilter.bind(this)}
            dateRange
            type={type}
            searchWithPerformer
            performerId={performerId || ''}
            defaultType={this.type}
          />
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive">
            <TableListFeed
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
              deleteFeed={this.deleteFeed.bind(this)}
            />
          </div>
        </Page>
      </>
    );
  }
}

export default withRouter(Feeds as any);
