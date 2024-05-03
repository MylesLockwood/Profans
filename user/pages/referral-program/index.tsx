import { PureComponent } from 'react';
import {
  Layout, message, Tabs, Row, Col, Statistic, Button
} from 'antd';
import { DollarOutlined, LinkOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import Head from 'next/head';
import { referralService } from '@services/index';
import { TableReferralEarning } from '@components/referral/table-earning';
import { TableReferralReport } from '@components/referral/table-report';
import { SearchFilter } from '@components/common/search-filter';
import Router from 'next/router';
import { IUIConfig, ISetting } from '../../src/interfaces';

interface IProps {
  user: any;
  ui: IUIConfig;
  settings: ISetting
}

const inititalState = {
  limit: 12,
  offset: 0,
  earnings: [],
  totalEarnings: 0,
  reports: [],
  totalReports: 0,
  filter: {} as any,
  stats: {} as any,
  sort: 'desc',
  sortBy: 'createdAt',
  fetching: false
};

class ReferralProgram extends PureComponent<IProps> {
  static authenticate: boolean = true;

  state = {
    ...inititalState,
    activeTab: 'earning'
  };

  async componentDidMount() {
    this.getEarnings();
  }

  async handlePageChange(data) {
    const { activeTab } = this.state;
    await this.setState({
      offset: data.current - 1
    });
    activeTab === 'earning' && this.getEarnings();
    activeTab === 'report' && this.getReport();
  }

  async handleFilter(data) {
    const { filter, activeTab } = this.state;
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
    activeTab === 'earning' && this.getEarnings();
    activeTab === 'report' && this.getReport();
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

  copyLink() {
    const { user } = this.props;
    const str = `${window.location.origin}/auth/content-creator-register?rel=${user._id}&relSource=${user.isPerformer ? 'performer' : 'user'}`;
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copied to clipboard');
  }

  render() {
    const { ui, settings, user } = this.props;
    const {
      fetching, earnings, limit, offset, totalEarnings, stats, totalReports, reports
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
            {`${ui.siteName} | Referral Program`}
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <LinkOutlined />
              {' '}
              Referral Program
            </span>
            <Button type="link" onClick={() => Router.push('/referral-program/payout-request')}>
              <DollarOutlined />
              {' '}
              Payout Requests
            </Button>
          </div>
          <h4>
            Copy and share your referral link to earn
            {' '}
            {(user?.referralCommission || user?.commissionSetting?.referralCommission || settings.referralCommission || 0) * 100}
            % commission in first year,
            <a aria-hidden onClick={() => this.copyLink()}> click here to copy.</a>
          </h4>
          <Tabs
            defaultActiveKey="earning"
            tabPosition="top"
            className="nav-tabs"
            onTabClick={(tab) => this.setState({ ...inititalState, activeTab: tab }, () => {
              if (tab === 'earning') {
                return this.getEarnings();
              }
              return this.getReport();
            })}
          >
            <Tabs.TabPane tab={<span>Earnings</span>} key="earning">
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
                    title="BALANCE"
                    prefix="$"
                    value={stats.totalRemaining || 0}
                    precision={2}
                  />
                </Col>
              </Row>
              <SearchFilter statuses={statuses} dateRange onSubmit={this.handleFilter.bind(this)} key="seach-eaning" />
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
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Records</span>} key="report">
              <SearchFilter dateRange onSubmit={this.handleFilter.bind(this)} key="seach-record" />
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
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current,
  ui: state.ui,
  settings: state.settings
});

const mapDispatch = { };
export default connect(mapStates, mapDispatch)(ReferralProgram);
