import { PureComponent } from 'react';
import {
  Layout, message
} from 'antd';
import Head from 'next/head';
import { referralService } from '@services/index';
import { TableReferralReport } from '@components/referral/table-report';
import { SearchFilter } from '@components/common/search-filter';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';

interface IProps {
}

const inititalState = {
  limit: 12,
  offset: 0,
  reports: [],
  totalReports: 0,
  filter: {} as any,
  sort: 'desc',
  sortBy: 'createdAt',
  fetching: false
};

export default class ReferralReports extends PureComponent<IProps> {
  static authenticate: boolean = true;

  state = {
    ...inititalState
  };

  async componentDidMount() {
    this.getReport();
  }

  async handlePageChange(data) {
    await this.setState({
      offset: data.current - 1
    });
    this.getReport();
  }

  async handleFilter(data) {
    const { filter } = this.state;
    await this.setState({
      filter: {
        ...filter,
        fromDate: data.fromDate || '',
        toDate: data.toDate || ''
      }
    });
    this.getReport();
  }

  async getReport() {
    try {
      const {
        offset, limit, sort, sortBy, filter
      } = this.state;
      await this.setState({ fetching: true });
      const resp = await referralService.referralReportList({
        ...filter,
        sort,
        sortBy,
        limit,
        offset
      });
      this.setState({
        reports: resp.data.data,
        totalReports: resp.data.total
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
      fetching, limit, offset, totalReports, reports
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>
            Referral Reports
          </title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Referral Reports' }]} />
        <Page>
          <SearchFilter dateRange onSubmit={this.handleFilter.bind(this)} key="seach-record" />
          <div style={{ marginBottom: 10 }} />
          <TableReferralReport
            dataSource={reports}
            pagination={{
              current: offset + 1,
              pageSize: limit,
              total: totalReports
            }}
            loading={fetching}
            onChange={this.handlePageChange.bind(this)}
          />
        </Page>
      </Layout>
    );
  }
}
