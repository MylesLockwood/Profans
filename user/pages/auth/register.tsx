/* eslint-disable prefer-promise-reject-errors */
import {
  Row, Col, Button, Layout, Form, Input, message,
  Divider, notification
} from 'antd';
import { PureComponent, createRef } from 'react';
import Link from 'next/link';
import { registerFan, loginSocial } from '@redux/auth/actions';
import { connect } from 'react-redux';
import Head from 'next/head';
import { ISetting, IUIConfig } from 'src/interfaces';
import { TwitterOutlined } from '@ant-design/icons';
import { authService, utilsService } from '@services/index';
import Loader from '@components/common/base/loader';
import GoogleLogin from 'react-google-login';
import Recaptcha from 'react-google-invisible-recaptcha';
import './index.less';

interface IProps {
  ui: IUIConfig;
  settings: ISetting;
  registerFan: Function;
  registerFanData: any;
  loginSocial: Function;
}

const openNotification = (notify: string) => {
  const key = `open${Date.now()}`;
  const btn = (
    <Button type="primary" size="small" onClick={() => notification.close(key)}>
      OK
    </Button>
  );
  notification.success({
    message: notify,
    description: '',
    btn,
    key,
    duration: 60
  });
};

class FanRegister extends PureComponent<IProps> {
  static authenticate: boolean = false;

  static layout = 'blank';

  formRef: any;

  recaptcha: any;

  state = {
    isLoading: false
  }

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    if (!this.recaptcha) this.recaptcha = createRef();
  }

  componentDidUpdate(prevProps) {
    const { registerFanData } = this.props;
    if (prevProps?.registerFanData?.data?.message !== registerFanData?.data?.message) {
      openNotification(registerFanData?.data?.message || 'We have sent you a verification email please check your email account you registered with');
    }
  }

  handleSubmit(values) {
    const { settings } = this.props;
    if (settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey) {
      this.recaptcha.execute();
      return;
    }
    this.handleRegister(values);
  }

  handleRegister = (data: any) => {
    const { registerFan: handleRegister } = this.props;
    handleRegister(data);
  };

  async handleVerifyCapcha(token: string) {
    // token should verify with secret key?
    const resp = await utilsService.verifyRecaptcha(token);
    if (resp?.data?.success && resp?.data?.score > 0.5) {
      const values = this.formRef.getFieldsValue();
      this.handleRegister(values);
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
    const {
      ui, registerFanData, settings
    } = this.props;
    const { requesting: submiting } = registerFanData;
    const { isLoading } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Sign up
          </title>
        </Head>
        <div className="main-container">
          <div className="login-box">
            <Row>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                className="login-content left"
                style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
              />
              <Col
                xs={24}
                sm={24}
                md={12}
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
                    labelCol={{ span: 24 }}
                    name="member_register"
                    ref={(ref) => { this.formRef = ref; }}
                    onFinish={this.handleSubmit.bind(this)}
                  >
                    <Form.Item
                      name="email"
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                      rules={[
                        {
                          type: 'email',
                          message: 'Invalid email address!'
                        },
                        {
                          required: true,
                          message: 'Please input your email address!'
                        }
                      ]}
                    >
                      <Input placeholder="Email address" />
                    </Form.Item>
                    {/* <Form.Item
                      name="username"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your username!' },
                        {
                          pattern: new RegExp(/^[a-zA-Z0-9]+$/g),
                          message:
                                'Username must contain alphanumerics only'
                        },
                        { min: 3, message: 'Username must containt at least 3 characters' }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="Username" />
                    </Form.Item> */}
                    <Form.Item
                      name="name"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your display name!' },
                        {
                          pattern: new RegExp(/^(?=.*\S).+$/g),
                          message:
                                'Display name can not contain only whitespace'
                        },
                        {
                          min: 3,
                          message: 'Display name must containt at least 3 characters'
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="Display name" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                      rules={[
                        {
                          pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g),
                          message: 'Password must have minimum 8 characters, at least one uppercase letter, one lowercase letter and one number'
                        },
                        { required: true, message: 'Please input your password!' }
                      ]}
                    >
                      <Input.Password placeholder="Password" />
                    </Form.Item>
                    {settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey && (
                    <Recaptcha
                      ref={(ref) => { this.recaptcha = ref; }}
                      sitekey={settings.googleReCaptchaSiteKey}
                      onResolved={this.handleVerifyCapcha.bind(this)}
                    />
                    )}
                    <Form.Item style={{ textAlign: 'center' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                        disabled={submiting}
                        loading={submiting}
                      >
                        SIGN UP
                      </Button>
                      <p style={{ margin: 0 }}>
                        By signing up you agree to our
                      </p>
                      <p>
                        <a href="/page/terms-of-service" target="_blank">Terms of Service</a>
                        {' '}
                        and
                        {' '}
                        <a href="/page/privacy-policy" target="_blank">Privacy & Policy</a>
                        , and confirm that you are at least 18 years old.
                      </p>
                      <p>
                        Have an account already?
                        <Link href="/">
                          <a> Login.</a>
                        </Link>
                      </p>
                      {/* <p>
                        Are you a content creator?
                        <Link href="/auth/content-creator-register">
                          <a> Sign up here.</a>
                        </Link>
                      </p> */}
                    </Form.Item>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        {isLoading && <Loader />}
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  registerFanData: { ...state.auth.registerFanData }
});

const mapDispatchToProps = { registerFan, loginSocial };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
