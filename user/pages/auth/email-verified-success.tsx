import { PureComponent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { connect } from 'react-redux';
import {
  Layout, Button, message
} from 'antd';
import './index.less';
import { IUser } from '@interfaces/user';
import { authService } from '@services/auth.service';
import { logout } from '@redux/auth/actions';
import { SocketContext } from 'src/socket';

interface IProps {
  ui: any;
  user: IUser;
  logout: Function;
}

class EmailVerifiedSuccess extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  async handleSwitchToPerformer() {
    const { user, logout: handleLogout } = this.props;
    if (!user._id) return;
    if (!window.confirm('By confirm to become a content creator, your current account will be change immediately!')) return;
    try {
      const resp = await authService.userSwitchToPerformer(user._id);
      message.success(resp?.data?.message || 'Switched account success!');
      const token = authService.getToken();
      const socket = this.context;
      token && socket && await socket.emit('auth/logout', {
        token
      });
      socket && socket.close();
      handleLogout();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  render() {
    const { ui, user } = this.props;
    const { siteName } = ui;
    return (
      <>
        <Head>
          <title>
            {siteName}
            {' '}
            | Email Verification
            {' '}
          </title>
        </Head>
        <Layout>
          <div className="email-verify-succsess">
            <p>
              Your email has been verified,
              <Link href="/">
                <a> click here to login</a>
              </Link>
            </p>
            {user._id && (
              <div>
                <Button className="primary" style={{ height: 60 }} onClick={this.handleSwitchToPerformer.bind(this)}>BECOME A CONTENT CREATOR</Button>
              </div>
            )}
          </div>
        </Layout>
      </>
    );
  }
}
EmailVerifiedSuccess.contextType = SocketContext;
const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});

export default connect(mapStatetoProps, { logout })(EmailVerifiedSuccess);
