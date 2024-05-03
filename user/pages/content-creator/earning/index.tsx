import {
  Layout, message, Row, Col, Statistic
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import {
  IPerformer,
  IUIConfig,
  IEarning,
  IPerformerStats
} from 'src/interfaces';
import { earningService } from 'src/services';
import { getResponseError } from '@lib/utils';
import { TableListEarning } from '@components/performer/table-earning';
import { SearchFilter } from 'src/components/common/search-filter';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  earning: IEarning[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
  stats: IPerformerStats;
  sortBy: string;
  sort: string;
  sourceType: string;
  dateRange: any;
}

class EarningPage extends PureComponent<IProps, IStates> {
  static onlyPerformer = true;

  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      earning: [],
      pagination: { total: 0, current: 1, pageSize: 10 },
      stats: {
        totalGrossPrice: 0,
        totalCommission: 0,
        totalNetPrice: 0
      },
      sortBy: 'createdAt',
      sort: 'desc',
      sourceType: '',
      dateRange: null
    };
  }

  componentDidMount() {
    this.getData();
    this.getPerformerStats();
  }

  async handleFilter(data) {
    const { dateRange } = this.state;
    await this.setState({
      sourceType: data.type,
      dateRange: {
        ...dateRange,
        fromDate: data.fromDate,
        toDate: data.toDate
      }
    });
    this.getData();
    this.getPerformerStats();
  }

  async handleTabsChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async getData() {
    const {
      pagination, sort, sortBy, sourceType, dateRange
    } = this.state;
    try {
      const { current, pageSize } = pagination;
      const earning = await earningService.performerSearch({
        limit: pageSize,
        offset: (current - 1) * pageSize,
        sort,
        sortBy,
        sourceType,
        ...dateRange
      });
      this.setState({
        earning: earning.data.data,
        pagination: { ...pagination, total: earning.data.total }
      });
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  async getPerformerStats() {
    const { dateRange, sourceType } = this.state;
    const resp = await earningService.performerStarts({
      sourceType,
      ...dateRange
    });
    this.setState({ stats: resp.data });
  }

  render() {
    const {
      loading, earning, pagination, stats
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Earning Report
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading">Earning Report</div>
          <Page>
            <SearchFilter
              type={[
                { key: '', text: 'All' },
                { key: 'monthly_subscription', text: 'Monthly Subscription' },
                { key: 'yearly_subscription', text: 'Yearly Subscription' },
                { key: 'private_chat', text: 'Private Chat' },
                { key: 'public_chat', text: 'Public Chat' },
                { key: 'digital_product', text: 'Digital Product' },
                { key: 'physical_product', text: 'Physical Product' },
                { key: 'sale_post', text: 'Post' },
                { key: 'tip_performer', text: 'Tip' }
              ]}
              onSubmit={this.handleFilter.bind(this)}
              dateRange
            />
            <Row gutter={16} style={{ marginBottom: '10px' }}>
              <Col span={8}>
                <Statistic
                  title="Total Price"
                  prefix="$"
                  value={stats.totalGrossPrice || 0}
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Admin earned"
                  prefix="$"
                  value={stats.totalCommission || 0}
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="You earned"
                  prefix="$"
                  value={stats.totalNetPrice || 0}
                  precision={2}
                />
              </Col>
            </Row>
            <div className="table-responsive">
              <TableListEarning
                dataSource={earning}
                rowKey="_id"
                pagination={pagination}
                loading={loading}
                onChange={this.handleTabsChange.bind(this)}
              />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(EarningPage);
