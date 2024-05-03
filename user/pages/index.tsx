import {
  Form, Checkbox, Input, Button, Row, Col, Divider, Layout, message
} from 'antd';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import {
  login, loginSuccess, loginSocial
} from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, userService, utilsService } from '@services/index';
import Link from 'next/link';
import { ISetting, IUIConfig } from 'src/interfaces';
import Router from 'next/router';
import { TwitterOutlined } from '@ant-design/icons';
import GoogleLogin from 'react-google-login';
import Recaptcha from 'react-google-invisible-recaptcha';
import './auth/index.less';

interface IProps {
  loginAuth: any;
  login: Function;
  updateCurrentUser: Function;
  loginSuccess: Function;
  loginSocial: Function;
  ui: IUIConfig;
  settings: ISetting
}

class Login extends PureComponent<IProps> {
  static authenticate: boolean = false;

  static layout = 'blank';

  recaptcha: any;

  formRef: any;

  state = {
    isLoading: true
  }

  async componentDidMount() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
    this.redirectLogin();
    this.callbackTwitter();
  }

  handleSubmit(values) {
    const { settings } = this.props;
    if (settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey) {
      this.recaptcha.execute();
      return;
    }
    this.handleLogin(values);
  }

  async handleLogin(values: any) {
    const { login: handleLogin } = this.props;
    handleLogin(values);
  }

  async handleVerifyCapcha(token: string) {
    // token should verify with secret key?
    const resp = await utilsService.verifyRecaptcha(token);
    if (resp?.data?.success && resp?.data?.score > 0.5) {
      const values = this.formRef.getFieldsValue(true);
      this.handleLogin(values);
    } else {
      message.error('Are you a robot?', 5);
    }
  }

  async onGoogleLogin(resp: any) {
    if (!resp.tokenId) {
      return;
    }
    const { loginSocial: handleLogin } = this.props;
    const payload = {
      tokenId: resp.tokenId
    };
    try {
      await this.setState({ isLoading: true });
      const response = await (await authService.loginGoogle(payload)).data;
      response.token && handleLogin({ token: response.token });
    } catch (e) {
      const error = await e;
      message.error(error && error.message ? error.message : 'Google login authenticated fail');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async redirectLogin() {
    const { loginSuccess: handleLogin, updateCurrentUser: handleUpdateUser } = this.props;
    const token = authService.getToken();
    if (!token || token === 'null') {
      this.setState({ isLoading: false });
      return;
    }
    try {
      authService.setToken(token);
      const user = await userService.me({
        Authorization: token
      });
      if (!user || !user.data || !user.data._id) return;
      handleLogin();
      handleUpdateUser(user.data);
      user.data.isPerformer && user.data.username ? Router.push({ pathname: '/content-creator/profile', query: { username: user.data.username || user.data._id } }, `/${user.data.username || user.data._id}`) : Router.push('/home');
    } catch {
      this.setState({ isLoading: false });
    }
  }

  async callbackTwitter() {
    const { loginSocial: handleLogin } = this.props;
    const oauthVerifier = Router.router.query && Router.router.query.oauth_verifier;
    const twitterToken = authService.getTwitterToken();
    if (!oauthVerifier || !twitterToken.oauthToken || !twitterToken.oauthTokenSecret) {
      return;
    }
    try {
      const auth = await authService.callbackLoginTwitter({
        oauth_verifier: oauthVerifier,
        oauthToken: twitterToken.oauthToken,
        oauthTokenSecret: twitterToken.oauthTokenSecret
      });
      auth.data && auth.data.token && handleLogin({ token: auth.data.token });
    } catch (e) {
      const error = await e;
      message.error(error && error.message ? error.message : 'Something went wrong, please try again later');
    }
  }

  async loginTwitter() {
    try {
      await this.setState({ isLoading: true });
      const resp = await (await authService.loginTwitter()).data;
      if (resp && resp.url) {
        authService.setTwitterToken({ oauthToken: resp.oauthToken, oauthTokenSecret: resp.oauthTokenSecret });
        window.location.href = resp.url;
      }
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Something went wrong, please try again later');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
    const { ui, settings, loginAuth } = this.props;
    const { isLoading } = this.state;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Welcome
          </title>
        </Head>
        <Layout>
          <div className="main-container">
            <div className="login-box">
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={6}
                  lg={12}
                  className="login-content left"
                  style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
                />
                <Col
                  xs={24}
                  sm={24}
                  md={18}
                  lg={12}
                  className="login-content right"
                >
                  {ui.logo && <div className="login-logo"><a href="/"><img alt="logo" src={ui.logo} height="80px" /></a></div>}
                  <p className="text-center"><small>The social network that pays you</small></p>
                  <div className="social-login">
                    <button type="button" onClick={() => this.loginTwitter()} className="twitter-button">
                      <TwitterOutlined />
                      {' '}
                      SIGN IN/ SIGN UP WITH TWITTER
                    </button>
                    <GoogleLogin
                      className="google-button"
                      clientId={settings.googleClientId}
                      buttonText="SIGN IN/ SIGN UP WITH GOOGLE"
                      onSuccess={this.onGoogleLogin.bind(this)}
                      onFailure={this.onGoogleLogin.bind(this)}
                      cookiePolicy="single_host_origin"
                    />
                  </div>
                  <Divider>Or</Divider>
                  <div className="login-form">
                    <Form
                      name="normal_login"
                      className="login-form"
                      initialValues={{ remember: true }}
                      ref={(ref) => { this.formRef = ref; }}
                      onFinish={this.handleSubmit.bind(this)}
                    >
                      <Form.Item
                        name="username"
                        hasFeedback
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          { required: true, message: 'Email address or Username is missing' }
                        ]}
                      >
                        <Input placeholder="Email or Username" />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        hasFeedback
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          { required: true, message: 'Please enter your password!' }
                        ]}
                      >
                        <Input.Password placeholder="Password" />
                      </Form.Item>
                      <Form.Item>
                        <Row>
                          <Col span={12}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                              <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Link
                              href={{
                                pathname: '/auth/forgot-password'
                              }}
                            >
                              <a className="login-form-forgot">Forgot password?</a>
                            </Link>
                          </Col>
                        </Row>
                      </Form.Item>
                      {settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey && (
                      <Recaptcha
                        ref={(ref) => { this.recaptcha = ref; }}
                        sitekey={settings.googleReCaptchaSiteKey}
                        onResolved={this.handleVerifyCapcha.bind(this)}
                      />
                      )}
                      <Form.Item style={{ textAlign: 'center' }}>
                        <Button disabled={loginAuth.requesting || isLoading} loading={loginAuth.requesting || isLoading} type="primary" htmlType="submit" className="login-form-button">
                          LOGIN
                        </Button>
                        <p>
                          Don&apos;t have an account yet?
                          <Link href="/auth/register">
                            <a>
                              {' '}
                              Sign up for
                              {' '}
                              {ui.siteName}
                            </a>
                          </Link>
                        </p>
                      </Form.Item>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Layout>
      </>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  loginAuth: { ...state.auth.loginAuth }
});

const mapDispatchToProps = {
  login, loginSocial, loginSuccess, updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login) as any;
