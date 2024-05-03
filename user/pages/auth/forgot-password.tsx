/* eslint-disable react/no-did-update-set-state */
import { PureComponent, createRef } from 'react';
import {
  Form, Input, Button, Layout, Col, Row, message
} from 'antd';
import { authService, utilsService } from '@services/index';
import Head from 'next/head';
import { IForgot, ISetting, IUIConfig } from 'src/interfaces';
import Recaptcha from 'react-google-invisible-recaptcha';
import { connect } from 'react-redux';
import Link from 'next/link';
import './index.less';

interface IProps {
  auth: any;
  ui: IUIConfig;
  settings: ISetting;
  forgot: Function;
  forgotData: any;
  query: any;
}

interface IState {
  submiting: boolean;
  countTime: number;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  static layout = 'blank';

  _intervalCountdown: any;

  recaptcha: any;

  formRef: any;

  state = {
    submiting: false,
    countTime: 60
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    return { query };
  }

  componentDidMount() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
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

  handleSubmit(values) {
    const { settings } = this.props;
    if (settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey) {
      this.recaptcha.execute();
      return;
    }
    this.handleReset(values);
  }

  async handleVerifyCapcha(token: string) {
    // token should verify with secret key?
    const resp = await utilsService.verifyRecaptcha(token);
    if (resp?.data?.success && resp?.data?.score > 0.5) {
      const values = this.formRef.getFieldsValue();
      this.handleReset(values);
    } else {
      message.error('Are you a robot?', 5);
    }
  }

  handleReset = async (data: IForgot) => {
    try {
      await this.setState({ submiting: true });
      await authService.resetPassword(data);
      message.success('An email has been sent to you to reset your password');
      this.handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  };

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

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
    const { ui, settings } = this.props;
    const { submiting, countTime } = this.state;
    return (
      <>
        <Head>
          <title>
            {ui?.siteName}
            {' '}
            | Forgot Password
          </title>
        </Head>
        <Layout>
          <div className="main-container">
            <div className="login-box">
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  className="login-content left fixed"
                  style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
                />
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  className="login-content right"
                  style={{ paddingTop: '50px' }}
                >
                  <div className="login-logo"><a href="/">{ui.logo ? <img alt="logo" src={ui.logo} height="80px" /> : ui.siteName}</a></div>
                  <h3
                    style={{
                      fontSize: 30,
                      textAlign: 'center',
                      fontFamily: 'Merriweather Sans Bold'
                    }}
                  >
                    Reset password
                  </h3>
                  <div>
                    <Form name="login-form" ref={(ref) => { this.formRef = ref; }} onFinish={this.handleSubmit.bind(this)}>
                      <Form.Item
                        hasFeedback
                        name="email"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            type: 'email',
                            message: 'Invalid email format'
                          },
                          {
                            required: true,
                            message: 'Please enter your email address!'
                          }
                        ]}
                      >
                        <Input placeholder="Enter your email address" />
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
                          className="primary"
                          type="primary"
                          htmlType="submit"
                          style={{
                            width: '100%',
                            marginBottom: 15,
                            fontWeight: 600,
                            padding: '5px 25px',
                            height: '42px'
                          }}
                          disabled={submiting || countTime < 60}
                          loading={submiting || countTime < 60}
                        >
                          {countTime < 60 ? 'Resend in' : 'Send'}
                          {' '}
                          {countTime < 60 && `${countTime}s`}
                        </Button>
                        <p>
                          Have an account already?
                          <Link href="/">
                            <a> Login here.</a>
                          </Link>
                        </p>
                        <p>
                          Don&apos;t have an account yet?
                          <Link href="/auth/register">
                            <a> Sign up here.</a>
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

const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings }
});

export default connect(mapStatetoProps)(Forgot);
