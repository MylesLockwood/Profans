import React from 'react';
import Head from 'next/head';
import { NotificationOutlined } from '@ant-design/icons';
import PayoutRequestForm from '@components/payout-request/form';
import { message, Layout } from 'antd';
import { connect } from 'react-redux';
import { payoutRequestService } from 'src/services';
import Router from 'next/router';
import { IUIConfig, IUser } from 'src/interfaces/index';

interface IProps {
  ui: IUIConfig;
  user: IUser;
}

class PayoutRequestCreatePage extends React.PureComponent<IProps> {
  static authenticate = true;

  state = {
    submiting: false,
    statsPayout: {
      totalEarnings: 0,
      previousPaidOut: 0,
      remainingUnpaid: 0
    }
  }

  componentDidMount() {
    this.calculateStatsPayout({
      fromDate: '',
      toDate: ''
    });
  }

  async handleFilter(data) {
    this.calculateStatsPayout(data);
  }

  calculateStatsPayout = async (filter) => {
    try {
      const resp = await payoutRequestService.calculate({
        fromDate: filter.fromDate || '',
        toDate: filter.toDate || ''
      });
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error('Something went wrong. Please try to input date again!');
    }
  };

  async submit(data: any) {
    try {
      const { user } = this.props;
      if (!data.requestPrice) {
        message.error('Your balance from that date range is not enough to send payout request, please check again');
        return;
      }
      if (data.paymentAccountType === 'paypal' && !user?.paypalSetting?.value?.emailAddress) {
        message.error('Please add your Palpal account first');
        return;
      }
      if (data.paymentAccountType === 'banking' && !user?.bankingSetting?.bankAccount) {
        message.error('Please add your bank account first');
        return;
      }
      await this.setState({ submiting: true });
      const body = { ...data, source: user.isPerformer ? 'performer' : 'user' };
      await payoutRequestService.create(body);
      message.success('Requested a payout');
      Router.push('/referral-program/payout-request');
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting, statsPayout } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Request a Payout`}</title>
        </Head>
        <div className="main-container">
          <div className="page-heading">
            <NotificationOutlined />
            {' '}
            Request a Payout
          </div>
          <PayoutRequestForm
            payout={{
              requestNote: '',
              paymentAccountType: 'paypal',
              fromDate: null,
              toDate: null,
              status: 'pending'
            }}
            statsPayout={statsPayout}
            onSelectDateRange={this.handleFilter.bind(this)}
            submit={this.submit.bind(this)}
            submiting={submiting}
          />
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  user: state.user.current
});

export default connect(mapStateToProps)(PayoutRequestCreatePage);
