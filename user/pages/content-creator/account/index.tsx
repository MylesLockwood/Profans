import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Tabs, message, Layout } from 'antd';
import {
  IPerformer,
  IBanking,
  IUIConfig,
  IBlockCountries
} from 'src/interfaces';
import {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
} from 'src/redux/user/actions';
import {
  authService, blockService, performerService, paymentService
} from '@services/index';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { BankingSettingsForm } from '@components/payment/banking-setting-form';
import { PaypalSettingForm } from '@components/payment/paypal-setting-form';
import {
  PerformerAccountForm,
  PerformerSubscriptionForm,
  PerformerBlockCountriesForm,
  PerformerVerificationForm
} from '@components/performer';
import Router from 'next/router';
import '../../user/index.less';

interface IProps {
  updating: boolean;
  currentUser: IPerformer;
  updatePerformer: Function;
  updateCurrentUserAvatar: Function;
  ui: IUIConfig;
  updateCurrentUserCover: Function;
}
class AccountSettings extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static onlyPerformer: boolean = true;

  _intervalCountdown: any;

  state = {
    pwUpdating: false,
    emailSending: false,
    countTime: 60,
    submiting: false
  };

  componentDidMount() {
    const { currentUser } = this.props;
    if (!currentUser || (currentUser && !currentUser.isPerformer)) {
      message.error('You have no permission on this page!');
      Router.push('/home');
    }
  }

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  }

  async handleUpdateBanking(data: IBanking) {
    try {
      const { currentUser } = this.props;
      await this.setState({ submiting: true });
      await paymentService.updateBankingSetting({
        ...data,
        source: 'performer',
        sourceId: currentUser._id
      });
      message.success('Changes saved.');
    } catch (error) {
      const err = await error;
      message.error(err?.message || 'Error occured, please try againl later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async handleUpdateBlockCountries(data: IBlockCountries) {
    try {
      await blockService.blockCountries(data);
      message.success('Changes saved');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
    }
  }

  async handleUpdatePaymentGatewaySettings(data: any, key: string) {
    try {
      const { currentUser } = this.props;
      await this.setState({ submiting: true });
      await paymentService.updatePaymentGatewaySetting({
        value: data,
        key,
        source: 'performer',
        sourceId: currentUser._id
      });
      message.success('Changes saved.');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error orccurred, please try again.');
    } finally {
      this.setState({ submiting: false });
    }
  }

  onAvatarUploaded(data: any) {
    const { updateCurrentUserAvatar: handleUpdateAvt } = this.props;
    message.success('Changes saved');
    handleUpdateAvt(data.response.data.url);
  }

  onCoverUploaded(data: any) {
    const { updateCurrentUserCover: handleUpdateCover } = this.props;
    message.success('Changes saved');
    handleUpdateCover(data.response.data.url);
  }

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  async submit(data: any) {
    const { currentUser, updatePerformer: handleUpdatePerformer } = this.props;
    handleUpdatePerformer({
      ...currentUser,
      ...data
    });
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, 'email', 'performer');
      message.success('Changes saved.');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  async verifyEmail() {
    const { currentUser } = this.props;
    try {
      await this.setState({ emailSending: true });
      const resp = await authService.verifyEmail({
        sourceType: 'performer',
        source: currentUser
      });
      this.handleCountdown();
      resp.data && resp.data.message && message.success(resp.data.message);
    } catch (e) {
      const error = await e;
      message.success(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ emailSending: false });
    }
  }

  render() {
    const {
      currentUser, updating, ui
    } = this.props;
    const {
      pwUpdating, emailSending, countTime, submiting
    } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Account Settings
            {' '}
          </title>
        </Head>
        <div className="main-container user-account">
          {!currentUser.verifiedDocument && (
          <div className="verify-info">
            Your ID documents are not verified yet! You could not post any content right now.
            <p>
              If you have any question, please contact our administrator to get more information.
            </p>
          </div>
          )}
          <Tabs defaultActiveKey="basic" tabPosition="top" className="nav-tabs">
            <Tabs.TabPane tab={<span>Basic Settings</span>} key="basic">
              <PerformerAccountForm
                onFinish={this.submit.bind(this)}
                updating={updating || emailSending}
                countTime={countTime}
                onVerifyEmail={this.verifyEmail.bind(this)}
                user={currentUser}
                options={{
                  uploadHeaders,
                  avatarUploadUrl: performerService.getAvatarUploadUrl(),
                  onAvatarUploaded: this.onAvatarUploaded.bind(this),
                  coverUploadUrl: performerService.getCoverUploadUrl(),
                  onCoverUploaded: this.onCoverUploaded.bind(this),
                  videoUploadUrl: performerService.getVideoUploadUrl()
                }}
                countries={ui.countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>ID Documents</span>} key="verification">
              <PerformerVerificationForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span>Pricing</span>}
              key="subscription"
            >
              <PerformerSubscriptionForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Banking</span>} key="bankInfo">
              <BankingSettingsForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={updating}
                user={currentUser}
                countries={ui.countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span>Paypal</span>}
              key="paypal"
            >
              <PaypalSettingForm
                onFinish={this.handleUpdatePaymentGatewaySettings.bind(this)}
                submiting={submiting}
                paypalSetting={currentUser?.paypalSetting}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Block Countries</span>} key="block">
              <PerformerBlockCountriesForm
                onFinish={this.handleUpdateBlockCountries.bind(this)}
                updating={updating}
                blockCountries={currentUser.blockCountries}
                countries={ui.countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Change Password</span>} key="password">
              <UpdatePaswordForm
                onFinish={this.updatePassword.bind(this)}
                updating={pwUpdating}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  ui: { ...state.ui }
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};
export default connect(mapStates, mapDispatch)(AccountSettings);
