import Head from 'next/head';
import { PureComponent } from 'react';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/user/account-form';
import { IUser, ICountry } from 'src/interfaces';
import { authService, paymentService, userService } from '@services/index';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { BankingForm } from '@components/performer/BankingForm';
import { PaypalSettingForm } from '@components/performer/paypal-setting';
import Loader from '@components/common/base/loader';
import { utilsService } from '@services/utils.service';

interface IProps {
  id: string;
  countries: ICountry[];
}
class UserUpdate extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data,
      ...ctx.query
    };
  }

  state = {
    updating: false,
    fetching: false,
    user: {} as IUser
  };

  async componentDidMount() {
    const { id } = this.props;
    try {
      await this.setState({ fetching: true });
      const resp = await userService.findById(id);
      this.setState({ user: resp.data });
    } catch (e) {
      message.error('Error while fecting user!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  onAvatarUploaded() {
    // TODO - check with current user if needed?
    message.success('Avatar has been updated!');
    // this.props.updateCurrentUserAvatar(data.base64);
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      this.setState({ updating: true });
      const updated = await userService.update(id, data);
      this.setState({ user: updated.data });
      message.success('Updated successfully');
    } catch (e) {
      // TODO - exact error message
      const error = await e;
      message.error(error && (error.message || 'An error occurred, please try again!'));
    } finally {
      this.setState({ updating: false });
    }
  }

  async updatePassword(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ updating: true });
      await authService.updatePassword(data.password, id, 'user');
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ updating: false });
    }
  }

  async updatePaymentGatewaySetting(data: any, key: string) {
    const { id } = this.props;
    try {
      await this.setState({ updating: true });
      await paymentService.updatePaymentGatewaySetting({
        source: 'user',
        sourceId: id,
        key,
        status: 'active',
        value: data
      });
      message.success('Updated successfully');
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ updating: false });
    }
  }

  async updateBankingSetting(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ updating: true });
      await paymentService.updateBankingSetting({
        ...data,
        source: 'performer',
        sourceId: id
      });
      message.success('Updated successfully');
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ updating: false });
    }
  }

  render() {
    const {
      user, updating, fetching
    } = this.state;
    const { countries } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <>
        <Head>
          <title>User update</title>
        </Head>
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <Tabs defaultActiveKey="basic" tabPosition="top">
              <Tabs.TabPane tab={<span>Basic info</span>} key="basic">
                <AccountForm
                  onFinish={this.submit.bind(this)}
                  user={user}
                  updating={updating}
                  options={{
                    uploadHeaders,
                    avatarUploadUrl: userService.getAvatarUploadUrl(user._id),
                    onAvatarUploaded: this.onAvatarUploaded.bind(this),
                    avatarUrl: user?.avatar
                  }}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Banking Settings</span>} key="banking">
                <BankingForm
                  submiting={updating}
                  onFinish={this.updateBankingSetting.bind(this)}
                  bankingInformation={user?.bankingSetting}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Paypal Settings</span>} key="ccbill">
                <PaypalSettingForm
                  submiting={updating}
                  onFinish={this.updatePaymentGatewaySetting.bind(this)}
                  paypalSetting={user?.paypalSetting}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm onFinish={this.updatePassword.bind(this)} updating={updating} />
              </Tabs.TabPane>
            </Tabs>
          )}
        </Page>
      </>
    );
  }
}

export default UserUpdate;
