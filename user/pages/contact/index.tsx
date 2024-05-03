/* eslint-disable react/no-did-update-set-state */
import { PureComponent, createRef } from 'react';
import {
  Form, Button, Layout, Input, message, Col, Row
} from 'antd';
import Head from 'next/head';
import { settingService, utilsService } from '@services/index';
import { connect } from 'react-redux';
import Recaptcha from 'react-google-invisible-recaptcha';
import { ISetting, IUIConfig } from '../../src/interfaces';
import '../auth/index.less';

const { TextArea } = Input;

interface IProps {
  ui: IUIConfig;
  settings: ISetting
}

class ContactPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect: boolean = true;

  _intervalCountdown: any;

  state = {
    submiting: false,
    countTime: 60
  }

  recaptcha: any;

  formRef: any;

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

  handleSubmit(values) {
    const { settings } = this.props;
    if (settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey) {
      this.recaptcha.execute();
      return;
    }
    this.onFinish(values);
  }

  async handleVerifyCapcha(token: string) {
    // token should verify with secret key?
    const resp = await utilsService.verifyRecaptcha(token);
    if (resp?.data?.success && resp?.data?.score > 0.5) {
      const values = this.formRef.getFieldsValue();
      this.onFinish(values);
    } else {
      message.error('Are you a robot?', 5);
    }
  }

  async onFinish(values) {
    try {
      await this.setState({ submiting: true });
      await settingService.contact(values);
      message.success('Thank you for contact us, we will reply within 48hrs.');
      this.handleCountdown();
    } catch (e) {
      message.error('Error occured, please try again later');
    } finally {
      this.formRef.resetFields();
      this.setState({ submiting: false });
    }
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
      <Layout>
        <Head>
          <title>
            {' '}
            {ui?.siteName}
            {' '}
            | Contact
            {' '}
          </title>
        </Head>
        <div className="main-container">
          <div className="login-box">
            <Row>
              <Col
                xs={24}
                sm={24}
                md={10}
                lg={12}
                className="login-content left"
                style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
              />
              <Col
                xs={24}
                sm={24}
                md={14}
                lg={12}
                className="login-content right"
              >
                <p className="text-center">
                  <span className="title">Contact</span>
                </p>
                <h5
                  className="text-center"
                  style={{ fontSize: 13, color: '#888' }}
                >
                  Please fill out all the info beside and we will get back to you with-in 48hrs.
                </h5>
                <Form
                  layout="vertical"
                  name="contact-from"
                  ref={(ref) => { this.formRef = ref; }}
                  onFinish={this.handleSubmit.bind(this)}
                >
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Tell us your name' }]}
                  >
                    <Input placeholder="Tell us your name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: 'Tell us your email address.'
                      },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <Input placeholder="Your valid email address" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: 'What can we help you?' },
                      {
                        min: 20,
                        message: 'Please input at least 20 characters.'
                      }
                    ]}
                  >
                    <TextArea rows={3} showCount maxLength={500} placeholder="What can we help you?" />
                  </Form.Item>
                  {settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey && (
                  <Recaptcha
                    ref={(ref) => { this.recaptcha = ref; }}
                    sitekey={settings.googleReCaptchaSiteKey}
                    onResolved={this.handleVerifyCapcha.bind(this)}
                  />
                  )}
                  <div className="text-center">
                    <Button
                      size="large"
                      className="primary"
                      type="primary"
                      htmlType="submit"
                      loading={submiting || countTime < 60}
                      disabled={submiting || countTime < 60}
                      style={{ fontWeight: 600, width: '100%', marginTop: 15 }}
                    >
                      {countTime < 60 ? 'Resend in' : 'Send Message'}
                      {' '}
                      {countTime < 60 && `${countTime}s`}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui,
  settings: state.settings
});
export default connect(mapStates)(ContactPage);
