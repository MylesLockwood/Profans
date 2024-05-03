import { PureComponent } from 'react';
import {
  Layout, message, Row, Col, Statistic
} from 'antd';
import Head from 'next/head';
import { referralService } from '@services/index';
import { TableReferralEarning } from '@components/referral/table-earning';
import { SearchFilter } from '@components/common/search-filter';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';

interface IProps {
}

const inititalState = {
  limit: 12,
  offset: 0,
  earnings: [],
  totalEarnings: 0,
  filter: {} as any,
  stats: {} as any,
  sort: 'desc',
  sortBy: 'createdAt',
  fetching: false
};

export default class ReferralEarnings extends PureComponent<IProps> {
  state = {
    ...inititalState
  };

  async componentDidMount() {
    this.getEarnings();
  }

  async handlePageChange(data) {
    await this.setState({
      offset: data.current - 1
    });
    this.getEarnings();
  }

  async handleFilter(data) {
    const { filter } = this.state;
    if (data.status) {
      // eslint-disable-next-line no-param-reassign
      data.isPaid = data.status === 'true';
      // eslint-disable-next-line no-param-reassign
      delete data.status;
    }
    await this.setState({
      filter: {
        ...filter,
        isPaid: data.isPaid || '',
        fromDate: data.fromDate || '',
        toDate: data.toDate || ''
      }
    });
    this.getEarnings();
  }

  async getEarnings() {
    try {
      const {
        offset, limit, sort, sortBy, filter
      } = this.state;
      await this.setState({ fetching: true });
      const [earnings, stats] = await Promise.all([
        referralService.referralEarningList({
          ...filter,
          sort,
          sortBy,
          limit,
          offset
        }),
        referralService.referralEarningStats({
          ...filter
        })
      ]);
      this.setState({
        earnings: earnings.data.data,
        totalEarnings: earnings.data.total,
        stats: stats.data
      });
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'An error occured. Please try again.');
    } finally {
      this.setState({ fetching: false });
    }
  }

  render() {
    const {
      fetching, earnings, limit, offset, totalEarnings, stats
    } = this.state;
    const statuses = [{
      key: '',
      text: 'All status'
    }, {
      key: 'true',
      text: 'Paid'
    }, {
      key: 'false',
      text: 'Non-paid'
    }];

    return (
      <Layout>
        <Head>
          <title>
            Referral Earnings
          </title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Referral earnings' }]} />
        <Page>
          <Row gutter={16} style={{ marginBottom: '10px' }}>
            <Col span={8}>
              <Statistic
                title="GROSS"
                prefix="$"
                value={stats.totalReferralGrossPrice || 0}
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="NET"
                prefix="$"
                value={stats.totalReferralNetPrice || 0}
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="REMAINING NON-PAID"
                prefix="$"
                value={stats.totalRemaining || 0}
                precision={2}
              />
            </Col>
          </Row>
          <SearchFilter statuses={statuses} dateRange onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: 10 }} />
          <TableReferralEarning
            dataSource={earnings}
            pagination={{
              current: offset + 1,
              pageSize: limit,
              total: totalEarnings
            }}
            loading={fetching}
            onChange={this.handlePageChange.bind(this)}
          />
        </Page>
      </Layout>
    );
  }
}
