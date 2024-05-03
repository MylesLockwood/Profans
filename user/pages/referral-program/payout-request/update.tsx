import React from 'react';
import Head from 'next/head';
import PayoutRequestForm from '@components/payout-request/form';
import { message } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import { payoutRequestService } from 'src/services';
import { IUIConfig, PayoutRequestInterface } from 'src/interfaces';
import nextCookie from 'next-cookies';
import Router from 'next/router';
import { connect } from 'react-redux';

interface Props {
  payout: PayoutRequestInterface;
  ui: IUIConfig
}

class PayoutRequestUpdatePage extends React.PureComponent<Props> {
  static authenticate = true;

  static async getInitialProps({ ctx }) {
    try {
      const {
        query: { data, id }
      } = ctx;
      if (process.browser && data) {
        return {
          payout: JSON.parse(data)
        };
      }

      const { token } = nextCookie(ctx);
      const resp = await payoutRequestService.detail(id, {
        Authorization: token
      });
      return {
        payout: resp.data
      };
    } catch {
      return {};
    }
  }

  state = {
    submiting: false,
    statsPayout: {
      totalEarnings: 0,
      previousPaidOut: 0,
      remainingUnpaid: 0
    }
  }

  componentDidMount() {
    const { payout } = this.props;
    if (!payout) {
      message.error('Could not find payout request');
      Router.back();
    }
    this.calculateStatsPayout({
      fromDate: '',
      toDate: ''
    });
  }

  async handleFilter(data) {
    this.calculateStatsPayout(data);
  }

  calculateStatsPayout = async (data) => {
    try {
      const resp = await payoutRequestService.calculate(data);
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error('Something went wrong. Please try to input date again!');
    }
  };

  async submit(data: any) {
    const { payout } = this.props;
    if (payout.status !== 'pending') {
      message.error('Please recheck request payout status');
      return;
    }
    if (!data.requestPrice) {
      message.error('Your balance from that date range is not enough to send payout request, please check again');
      return;
    }
    try {
      await this.setState({ submiting: true });
      const body = {
        paymentAccountType: data.paymentAccountType,
        requestNote: data.requestNote,
        requestPrice: data.requestPrice,
        fromDate: data.fromDate,
        toDate: data.toDate
      };
      await payoutRequestService.update(payout._id, body);
      message.success('Changes saved!');
      Router.back();
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { payout, ui } = this.props;
    const { submiting, statsPayout } = this.state;
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Edit Payout Request `}</title>
        </Head>
        <div className="main-container">
          <div className="page-heading">
            <NotificationOutlined />
            {' '}
            Edit Payout Request
          </div>
          <PayoutRequestForm
            statsPayout={statsPayout}
            payout={payout}
            submit={this.submit.bind(this)}
            submiting={submiting}
            onSelectDateRange={this.handleFilter.bind(this)}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui
});

export default connect(mapStateToProps)(PayoutRequestUpdatePage);
