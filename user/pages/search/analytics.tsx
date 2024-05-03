import { PureComponent } from 'react';
import {
  message, Tag, Spin, Button, Badge, Layout
} from 'antd';
import {
  searchService
} from '@services/index';
import Head from 'next/head';
import { connect } from 'react-redux';
import {
  IUIConfig, IUser
} from '@interfaces/index';
import {
  SearchOutlined
} from '@ant-design/icons';
import './index.less';

interface IProps {
  ui: IUIConfig;
  currentUser: IUser;
  keyword: string;
  result: any;
  type: string;
}

class PageSearch extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    searching: false,
    items: [],
    offset: 0,
    total: 0,
    dateRange: ''
  }

  async componentDidMount() {
    this.getListKeywords();
  }

  async onSortByDate(dateRange: string) {
    await this.setState({ offset: 0, dateRange, items: [] });
    this.getListKeywords();
  }

  async getListKeywords() {
    const { offset, items, dateRange } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await (await searchService.listByKeyword({
        limit: 99,
        offset: offset * 99,
        dateRange
      })).data;
      this.setState({ items: items.concat(resp.data), total: resp.total });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ searching: false });
    }
  }

  async loadMore() {
    const { offset } = this.state;
    await this.setState({ offset: offset + 1 });
    this.getListKeywords();
  }

  render() {
    const { ui } = this.props;
    const {
      searching, items, total, dateRange
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | What people are searching for?`}
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading">
            <SearchOutlined />
            {' '}
            What people are searching for
          </div>
          <div className="date-range-filter">
            <Button type={dateRange === '' ? 'primary' : 'link'} onClick={() => this.onSortByDate('')}>All</Button>
            <Button type={dateRange === 'day' ? 'primary' : 'link'} onClick={() => this.onSortByDate('day')}>Today</Button>
            <Button type={dateRange === 'week' ? 'primary' : 'link'} onClick={() => this.onSortByDate('week')}>Last 7 Days</Button>
            <Button type={dateRange === 'month' ? 'primary' : 'link'} onClick={() => this.onSortByDate('month')}>Last 30 Days</Button>
          </div>
          <div className="list-keyword">
            {items.length > 0 && items.map((item) => (
              <Tag key={item._id}>
                {`${item.keyword}`}
                &nbsp;
                <Badge count={item.attempt} overflowCount={99} />
              </Tag>
            ))}
          </div>
          {!items.length && !searching && <div className="text-center">No keyword was found</div>}
          {searching && <div className="text-center"><Spin /></div>}
          {!searching && total > items.length && <div className="text-center"><Button type="link" onClick={() => this.loadMore()}>Load more...</Button></div>}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui }
});

export default connect(mapStates)(PageSearch);
