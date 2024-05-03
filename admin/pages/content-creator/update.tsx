import Head from 'next/head';
import { PureComponent } from 'react';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/performer/AccountForm';
import { PerformerDocument } from '@components/performer/Document';
import { SubscriptionForm } from '@components/performer/Subcription';
import { BankingForm } from '@components/performer/BankingForm';
import { CCbillSettingForm } from '@components/performer/ccbill-setting';
import { PaypalSettingForm } from '@components/performer/paypal-setting';
import { CommissionSettingForm } from '@components/performer/commission-setting';
import {
  ICountry
} from 'src/interfaces';
import {
  authService, performerService, paymentService
} from '@services/index';
import Loader from '@components/common/base/loader';
import { utilsService } from '@services/utils.service';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { BreadcrumbComponent } from '@components/common';
import { omit } from 'lodash';

interface IProps {
  id: string;
  countries: ICountry[];
}
class PerformerUpdate extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    const [countries] = await Promise.all([
      utilsService.countriesList()
    ]);
    return {
      countries: countries && countries.data ? countries.data : [],
      ...ctx.query
    };
  }

  state = {
    pwUpdating: false,
    updating: false,
    fetching: false,
    performer: {} as any,
    settingUpdating: false,
    avatarUrl: '',
    coverUrl: ''
  };

  customFields = {};

  async componentDidMount() {
    const { id } = this.props;
    try {
      this.setState({ fetching: true });
      const resp = await (await performerService.findById(id)).data;
      this.setState({ performer: resp });
      resp.avatar && this.setState({ avatarUrl: resp.avatar });
      resp.cover && this.setState({ coverUrl: resp.cover });
    } catch (e) {
      message.error('Error while fecting performer!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  onUploaded(field: string, resp: any) {
    if (field === 'avatarId') {
      this.setState({ avatarUrl: resp.response.data.url });
    }
    if (field === 'coverId') {
      this.setState({ coverUrl: resp.response.data.url });
    }
    this.customFields[field] = resp.response.data._id;
  }

  async updatePassword(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, id, 'performer');
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  async updatePaymentGatewaySetting(data: any, key: string) {
    const { id } = this.props;
    try {
      await this.setState({ settingUpdating: true });
      await paymentService.updatePaymentGatewaySetting({
        source: 'performer',
        sourceId: id,
        key,
        status: 'active',
        value: data
      });
      message.success(`${key.toUpperCase()} settings were updated successful`);
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ settingUpdating: false });
    }
  }

  async updateCommissionSetting(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ settingUpdating: true });
      await performerService.updateCommissionSetting(id, { ...data, performerId: id });
      message.success('Commission settings has been updated!');
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ settingUpdating: false });
    }
  }

  async updateBankingSetting(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ settingUpdating: true });
      await paymentService.updateBankingSetting({
        ...data,
        source: 'performer',
        sourceId: id
      });
      message.success('Banking settings has been updated!');
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ settingUpdating: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    const { performer } = this.state;
    let newData = data;
    try {
      if (data.status === 'pending-email-confirmation') {
        newData = omit(data, ['status']);
      }
      await this.setState({ updating: true });
      const updated = await performerService.update(id, {
        ...performer,
        ...newData,
        ...this.customFields
      });
      this.setState({ performer: updated.data });
      message.success('Updated successfully');
    } catch (e) {
      // TODO - exact error message
      const error = await e;
      message.error(error && (error.message || 'An error occurred, please try again!'));
    } finally {
      this.setState({ updating: false });
    }
  }

  render() {
    const {
      pwUpdating, performer, updating, fetching, settingUpdating,
      avatarUrl, coverUrl
    } = this.state;
    const {
      countries
    } = this.props;
    return (
      <>
        <Head>
          <title>Content creator update</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Content Creators', href: '/content-creator' },
            { title: performer.username },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <Tabs defaultActiveKey="basic" tabPosition="top">
              <Tabs.TabPane tab={<span>Basic Settings</span>} key="basic">
                <AccountForm
                  onUploaded={this.onUploaded.bind(this)}
                  onFinish={this.submit.bind(this)}
                  performer={performer}
                  submiting={updating}
                  countries={countries}
                  avatarUrl={avatarUrl}
                  coverUrl={coverUrl}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Subscription Settings</span>} key="subscription">
                <SubscriptionForm
                  submiting={updating}
                  onFinish={this.submit.bind(this)}
                  performer={performer}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Banking Settings</span>} key="banking">
                <BankingForm
                  submiting={settingUpdating}
                  onFinish={this.updateBankingSetting.bind(this)}
                  bankingInformation={performer?.bankingSetting}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Paypal Settings</span>} key="paypal">
                <PaypalSettingForm
                  submiting={settingUpdating}
                  onFinish={this.updatePaymentGatewaySetting.bind(this)}
                  paypalSetting={performer.paypalSetting}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>CCbill Settings</span>} key="ccbill">
                <CCbillSettingForm
                  submiting={settingUpdating}
                  onFinish={this.updatePaymentGatewaySetting.bind(this)}
                  ccbillSetting={performer.ccbillSetting}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Commission Settings</span>} key="commission">
                <CommissionSettingForm
                  submiting={settingUpdating}
                  onFinish={this.updateCommissionSetting.bind(this)}
                  commissionSetting={performer.commissionSetting}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>ID Documents</span>} key="document">
                <PerformerDocument
                  submiting={updating}
                  onUploaded={this.onUploaded.bind(this)}
                  onFinish={this.submit.bind(this)}
                  performer={performer}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm onFinish={this.updatePassword.bind(this)} updating={pwUpdating} />
              </Tabs.TabPane>
            </Tabs>
          )}
        </Page>
      </>
    );
  }
}

export default PerformerUpdate;
