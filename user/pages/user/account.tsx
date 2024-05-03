/* eslint-disable react/no-did-update-set-state */
import { PureComponent } from 'react';
import { Layout, Tabs, message } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import { UserAccountForm } from '@components/user/account-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
// import { BankingSettingsForm } from '@components/payment/banking-setting-form';
// import { PaypalSettingForm } from '@components/payment/paypal-setting-form';
import { IUser, IUserFormData } from 'src/interfaces/user';
import { authService, userService } from '@services/index';
import {
  updateUser, updateCurrentUserAvatar, updatePassword, updateCurrentUser
} from 'src/redux/user/actions';
import { SocketContext } from 'src/socket';
import { logout } from '@redux/auth/actions';
import Router from 'next/router';
// import { getResponseError } from '@lib/utils';
import { IUIConfig } from 'src/interfaces';
import './index.less';

interface IProps {
  onFinish(): Function;
  user: IUser;
  updating: boolean;
  updateUser: Function;
  updateCurrentUserAvatar: Function;
  updateCurrentUser: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  error: any;
  ui: IUIConfig;
  logout: Function;
}
interface IState {
  submiting: boolean;
  countTime: number;
}

class UserAccountSettingPage extends PureComponent<IProps, IState> {
  static authenticate: boolean = true;

  _intervalCountdown: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      submiting: false,
      countTime: 60
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
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

  async handleSwitchToPerformer() {
    const { user, updateCurrentUser: handleUpdateCurrentUser } = this.props;
    if (!user._id) return;
    if (!window.confirm('By confirming okay your account will change to become a content creator account immediately!')) return;
    try {
      const resp = await authService.userSwitchToPerformer(user._id);
      message.success('Switched to content creator account success!');
      if (resp.data && resp.data.token) {
        authService.setToken(resp.data.token);
        const data = await userService.me({
          Authorization: resp.data.token
        });
        handleUpdateCurrentUser(data.data);
        Router.replace('/content-creator/account');
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  // async handleUpdateBanking(data: IBanking) {
  //   try {
  //     const { user } = this.props;
  //     await this.setState({ submiting: true });
  //     await paymentService.updateBankingSetting({
  //       ...data,
  //       source: 'user',
  //       sourceId: user._id
  //     });
  //     message.success('Changes saved.');
  //   } catch (error) {
  //     message.error(
  //       getResponseError(error) || 'An error orccurred, please try again.'
  //     );
  //   } finally {
  //     this.setState({ submiting: false });
  //   }
  // }

  // async handleUpdatePaymentGatewaySettings(data: any, key: string) {
  //   try {
  //     const { user } = this.props;
  //     await this.setState({ submiting: true });
  //     await paymentService.updatePaymentGatewaySetting({
  //       value: data,
  //       key,
  //       source: 'user',
  //       sourceId: user._id
  //     });
  //     message.success('Changes saved.');
  //   } catch (error) {
  //     message.error(
  //       getResponseError(error) || 'An error orccurred, please try again.'
  //     );
  //   } finally {
  //     this.setState({ submiting: false });
  //   }
  // }

  onFinish(data: IUserFormData) {
    const { updateUser: handleUpdateUser } = this.props;
    handleUpdateUser(data);
  }

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  uploadAvatar(data) {
    const { updateCurrentUserAvatar: handleUpdateUserAvt } = this.props;
    handleUpdateUserAvt(data.response.data.url);
  }

  updatePassword(data: any) {
    const { updatePassword: handleUpdateUserPw } = this.props;
    handleUpdateUserPw(data.password);
  }

  async verifyEmail() {
    const { user } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await authService.verifyEmail({
        sourceType: 'user',
        source: user
      });
      this.handleCountdown();
      resp.data && resp.data.message && message.success(resp.data.message);
    } catch (e) {
      const error = await e;
      message.success(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { user, updating, ui } = this.props;
    const { submiting, countTime } = this.state;
    const uploadHeader = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Account
          </title>
        </Head>
        <div className="main-container user-account">
          <Tabs defaultActiveKey="user-profile" tabPosition="top" className="nav-tabs">
            <Tabs.TabPane tab={<span>Basic Information</span>} key="basic">
              <UserAccountForm
                onFinish={this.onFinish.bind(this)}
                updating={updating || submiting}
                user={user}
                options={{
                  uploadHeader,
                  avatarUrl: userService.getAvatarUploadUrl(),
                  uploadAvatar: this.uploadAvatar.bind(this)
                }}
                countTime={countTime}
                onVerifyEmail={this.verifyEmail.bind(this)}
                onSwitchToPerformer={this.handleSwitchToPerformer.bind(this)}
              />
            </Tabs.TabPane>
            {/* <Tabs.TabPane
              tab={<span>Banking Settings</span>}
              key="bankInfo"
            >
              <BankingSettingsForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={updating}
                user={user}
                countries={ui?.countries || []}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span>Paypal Settings</span>}
              key="paypal"
            >
              <PaypalSettingForm
                onFinish={this.handleUpdatePaymentGatewaySettings.bind(this)}
                submiting={submiting}
                paypalSetting={user?.paypalSetting}
              />
            </Tabs.TabPane> */}
            <Tabs.TabPane tab={<span>Change password</span>} key="password">
              <UpdatePaswordForm
                onFinish={this.updatePassword.bind(this)}
                updating={submiting}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

UserAccountSettingPage.contextType = SocketContext;

const mapStates = (state) => ({
  user: state.user.current,
  updating: state.user.updating,
  error: state.user.error,
  updateSuccess: state.user.updateSuccess,
  ui: { ...state.ui }
});
const mapDispatch = {
  updateUser, updateCurrentUser, updateCurrentUserAvatar, updatePassword, logout
};
export default connect(mapStates, mapDispatch)(UserAccountSettingPage);
