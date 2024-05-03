/* eslint-disable no-nested-ternary */
import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import {
  message, Statistic, Row, Col
} from 'antd';
import Page from '@components/common/layout/page';
import { earningService } from '@services/earning.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListEarning } from '@components/earning/table-list-earning';
import { BreadcrumbComponent } from '@components/common';
import { pick } from 'lodash';

interface IEarningStatResponse {
  totalCommission: number;
  totalGrossPrice: number;
  totalNetPrice: number;
}

interface IProps {
  sourceId: string;
  stats: IEarningStatResponse;
}

class Earning extends PureComponent<IProps> {
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
    sort: 'desc',
    stats: {
      totalGrossPrice: 0,
      totalCommission: 0,
      totalNetPrice: 0
    } as IEarningStatResponse
  };

  async componentDidMount() {
    this.search();
    this.stats();
  }

  handleTableChange = (pagi, filters, sorter) => {
    const { pagination } = this.state;
    const pager = { ...pagination };
    pager.current = pagi.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
    this.stats();
  }

  async search(page = 1) {
    const {
      filter, limit, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await earningService.search({
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

  async stats() {
    const { filter } = this.state;
    try {
      const resp = await earningService.stats({
        ...filter
      });
      await this.setState({
        stats: resp.data
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
    }
  }

  async updatePaidStatus() {
    try {
      const { filter } = this.state;
      if (!filter.performerId) {
        return message.error('Please filter by a performer and date range');
      }
      if (!filter.fromDate || !filter.toDate) {
        return message.error('Please filter by performer and date range');
      }
      await earningService.updatePaidStatus(pick(filter, ['performerId', 'fromDate', 'toDate']));
      message.success('Updated successfully');
      this.search();
      this.stats();
    } catch (error) {
      message.error('An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const {
      list, searching, pagination, stats
    } = this.state;

    // const statuses = [
    //   {
    //     key: '',
    //     text: 'All'
    //   },
    //   {
    //     key: 'true',
    //     text: 'Paid'
    //   },
    //   {
    //     key: 'false',
    //     text: 'Unpaid'
    //   }
    // ];
    const type = [
      {
        key: '',
        text: 'All Type'
      },
      {
        key: 'monthly_subscription',
        text: 'Monthly Subscription'
      },
      {
        key: 'yearly_subscription',
        text: 'Yearly Subscription'
      },
      {
        key: 'free_subscription',
        text: 'Free Subscription'
      },
      {
        key: 'digital_product',
        text: 'Digital Product'
      },
      {
        key: 'physical_product',
        text: 'Physical Product'
      },
      {
        key: 'performer_post',
        text: 'Post'
      },
      {
        key: 'tip_performer',
        text: 'Tip'
      }
    ];

    return (
      <>
        <Head>
          <title>Earnings Report</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Earnings Report' }]} />
        <Page>
          <Row gutter={16} style={{ marginBottom: '10px' }}>
            <Col span={8}>
              <Statistic title="Total price" prefix="$" value={stats?.totalGrossPrice || 0} precision={2} />
            </Col>
            <Col span={8}>
              <Statistic title="Admin earned" prefix="$" value={stats?.totalCommission || 0} precision={2} />
            </Col>
            <Col span={8}>
              <Statistic title="Content creators earned" prefix="$" value={stats?.totalNetPrice || 0} precision={2} />
            </Col>
            {/* <Col span={8}>
              <Statistic title="Paid" prefix={'$'} value={stats.paidPrice} precision={2} />
            </Col> */}
            {/* <Col span={8}>
              <Statistic title="Remaining" prefix={'$'} value={stats.remainingPrice} precision={2} />
              <Button
                disabled={stats.remainingPrice <= 0}
                type="primary"
                onClick={() => stats.remainingPrice > 0 && this.updatePaidStatus()}>
                Update Paid Status
              </Button>
            </Col> */}
          </Row>
          <SearchFilter
            // statuses={statuses}
            type={type}
            onSubmit={this.handleFilter.bind(this)}
            searchWithPerformer
            dateRange
          // keyFilter={'isPaid'}
          // dateRange={true}
          />
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive">
            <TableListEarning
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
            />
          </div>
        </Page>
      </>
    );
  }
}

export default Earning;
