import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { ICountry } from 'src/interfaces';
import Router from 'next/router';
import { userService } from '@services/index';
import { utilsService } from '@services/utils.service';
import { getResponseError } from '@lib/utils';
import { AccountForm } from '@components/user/account-form';

interface IProps {
  countries: ICountry[];
}

class UserCreate extends PureComponent<IProps> {
  static async getInitialProps() {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data
    };
  }

  state = {
    creating: false
  };

  _avatar: File;

  onBeforeUpload = async (file) => {
    this._avatar = file;
  }

  async submit(data: any) {
    try {
      if (data.password !== data.rePassword) {
        message.error('Confirm password mismatch!');
      }
      await this.setState({ creating: true });
      const resp = await userService.create(data);
      if (this._avatar) {
        await userService.uploadAvatarUser(this._avatar, resp.data._id);
      }
      message.success('Created successfully');
      Router.push('/users');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(getResponseError(err) || 'An error occurred, please try again!');
      this.setState({ creating: false });
    }
  }

  render() {
    const { creating } = this.state;
    const { countries } = this.props;
    // const uploadHeaders = {
    //   authorization: authService.getToken()
    // };
    return (
      <>
        <Head>
          <title>Create user</title>
        </Head>
        <Page>
          <AccountForm
            onFinish={this.submit.bind(this)}
            updating={creating}
            options={{
              beforeUpload: this.onBeforeUpload.bind(this)
            }}
            countries={countries}
          />
        </Page>
      </>
    );
  }
}

export default UserCreate;
