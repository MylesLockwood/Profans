/* eslint-disable prefer-promise-reject-errors */
import {
  Row, Col, Button, Layout, Form, Input, Select, message, DatePicker, Image
} from 'antd';
import { PureComponent, createRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { connect } from 'react-redux';
import { registerPerformer } from '@redux/auth/actions';
import { IUIConfig, ISetting } from 'src/interfaces';
import { ImageUpload } from '@components/file';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { utilsService } from '@services/index';
import Recaptcha from 'react-google-invisible-recaptcha';
import moment from 'moment';
import dynamic from 'next/dynamic';
import './index.less';

const FaceImage = dynamic(() => import('src/components/face-detect/index'), { ssr: false });

const { Option } = Select;

interface IProps {
  settings: ISetting;
  registerPerformerData: any;
  registerPerformer: Function;
  ui: IUIConfig;
}

class RegisterPerformer extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  enquireHandler: any;

  idVerificationFile = null;

  documentVerificationFile = null;

  recaptcha: any;

  formRef: any;

  state = {
    selectedGender: 'male',
    idImage: '',
    documentImage: '',
    isMobile: false
  };

  componentDidMount() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile
        });
      }
    });
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  handleSubmit(values) {
    const { settings } = this.props;
    if (settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey) {
      this.recaptcha.execute();
      return;
    }
    this.register(values);
  }

  async handleVerifyCapcha(token: string) {
    // token should verify with secret key?
    const resp = await utilsService.verifyRecaptcha(token);
    if (resp?.data?.success && resp?.data?.score > 0.5) {
      const values = this.formRef.getFieldsValue();
      this.register(values);
    } else {
      message.error('Are you a robot?', 5);
    }
  }

  onFileReaded = (type, file: File) => {
    if (file && type === 'idFile') {
      this.idVerificationFile = file;
    }
    if (file && type === 'documentFile') {
      this.documentVerificationFile = file;
    }
  }

  onFaceSelect(type: string, data: any) {
    const { file, image } = data;
    if (file && type === 'idFile') {
      this.idVerificationFile = file;
      image && this.setState({ idImage: image });
    }
    if (file && type === 'documentFile') {
      this.documentVerificationFile = file;
      image && this.setState({ documentImage: image });
    }
  }

  register = (values: any) => {
    const data = values;
    const { registerPerformer: registerPerformerHandler } = this.props;
    if (!this.idVerificationFile || !this.documentVerificationFile) {
      return message.error('ID documents are required');
    }
    data.idVerificationFile = this.idVerificationFile;
    data.documentVerificationFile = this.documentVerificationFile;
    return registerPerformerHandler(data);
  };

  render() {
    if (!this.recaptcha) this.recaptcha = createRef();
    if (!this.formRef) this.formRef = createRef();
    const { registerPerformerData = { requesting: false }, ui, settings } = this.props;
    const {
      selectedGender, idImage, documentImage, isMobile
    } = this.state;

    const placeholderIdImg = () => {
      switch (selectedGender) {
        case 'male': return '/static/img-id-man.png';
        case 'female': return '/static/img-id-woman.png';
        default: return '/static/img-id-man.png';
      }
    };

    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Content Creator Sign Up
          </title>
        </Head>
        <div className="main-container">
          <div className="login-box register-box">
            <div className="login-logo"><a href="/">{ui.logo ? <img alt="logo" src={ui.logo} height="80px" /> : ui.siteName}</a></div>
            <p className="text-center"><small>The social network that pays you</small></p>
            <p className="text-center">
              <span className="title">Content Creator Sign Up</span>
            </p>
            <Form
              name="member_register"
              initialValues={{
                gender: 'male',
                country: 'US',
                dateOfBirth: ''
              }}
              ref={(ref) => { this.formRef = ref; }}
              onFinish={this.handleSubmit.bind(this)}
            >
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={14}
                  lg={14}
                >
                  <Row>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          { required: true, message: 'Please input your name!' },
                          {
                            pattern: new RegExp(
                              /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                            ),
                            message:
                              'First name can not contain number and special character'
                          }
                        ]}
                        hasFeedback
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          { required: true, message: 'Please input your name!' },
                          {
                            pattern: new RegExp(
                              /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                            ),
                            message:
                              'Last name can not contain number and special character'
                          }
                        ]}
                        hasFeedback
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Display Name"
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
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="username"
                        label="Username"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          { required: true, message: 'Please input your username!' },
                          {
                            pattern: new RegExp(/^[a-zA-Z0-9]+$/g),
                            message:
                              'Username must contain only Alphabets & Numbers'
                          },
                          { min: 3, message: 'Username must containt at least 3 characters' }
                        ]}
                        hasFeedback
                      >
                        <Input placeholder="eg: justin101, ChrisT01, zues99,..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        validateTrigger={['onChange', 'onBlur']}
                        hasFeedback
                        rules={[
                          {
                            type: 'email',
                            message: 'The input is not valid E-mail!'
                          },
                          {
                            min: 6,
                            message: 'Password must contain at least 6 characters.'
                          },
                          {
                            required: true,
                            message: 'Please input your E-mail!'
                          }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="dateOfBirth"
                        label="Date of Birth"
                        validateTrigger={['onChange', 'onBlur']}
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: 'Select your date of birth'
                          }
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          placeholder="DD/MM/YYYY"
                          disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(12, 'year').endOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Country" name="country" rules={[{ required: true }]} hasFeedback>
                        <Select
                          showSearch
                          optionFilterProp="label"
                        >
                          {ui?.countries
                            && ui?.countries.length > 0
                            && ui?.countries.map((c) => (
                              <Option value={c.code} label={c.name} key={c.code}>
                                <Image src={c.flag} alt="flag" fallback="/static/no-image.jpg" width={25} preview={false} />
                                {' '}
                                {c.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gender"
                        label="Gender"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: true, message: 'Please select your gender' }]}
                        hasFeedback
                      >
                        <Select onChange={(val) => this.setState({ selectedGender: val })}>
                          <Option value="male" key="male">Male</Option>
                          <Option value="female" key="female">Female</Option>
                          <Option value="transgender" key="trans">Trans</Option>
                          <Option value="genderfluid" key="genderFluid">Genderfluid</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Password"
                        name="password"
                        validateTrigger={['onChange', 'onBlur']}
                        hasFeedback
                        rules={[
                          { required: true, message: 'Please input your Password!' },
                          {
                            pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g),
                            message: 'Password must have minimum 8 characters, at least one uppercase letter, one lowercase letter and one number'
                          }
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter confirm password!'
                          },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Passwords do not match together!');
                            }
                          })
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={10}
                  lg={10}
                >
                  <div className="register-form">
                    <Form.Item
                      name="idVerificationId"
                      className="model-photo-verification"
                      help="Upload a photo of yourself holding your indentity document next to your face"
                    >
                      <div className="id-block">
                        {isMobile ? <ImageUpload accept="image/*;capture=camera" onFileReaded={this.onFileReaded.bind(this, 'idFile')} /> : <FaceImage onOk={this.onFaceSelect.bind(this, 'idFile')} />}
                        {!this.idVerificationFile && <img alt="identity-img" className="img-id" src={placeholderIdImg()} />}
                        {idImage && <img alt="identity-img" className="img-id" src={idImage} />}
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="documentVerificationId"
                      className="model-photo-verification"
                      help="Please upload proof of one of either of the following: social security number or national insurance number or passport or a different photographic id to your photo verification"
                    >
                      <div className="id-block">
                        {isMobile ? <ImageUpload accept="image/*;capture=camera" onFileReaded={this.onFileReaded.bind(this, 'idFile')} /> : <FaceImage onOk={this.onFaceSelect.bind(this, 'documentFile')} />}
                        {!this.documentVerificationFile && <img alt="identity-img" className="img-id" src="/static/id-document.png" />}
                        {documentImage && <img alt="identity-img" className="img-id" src={documentImage} />}
                      </div>
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Form.Item style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={registerPerformerData.requesting}
                  loading={registerPerformerData.requesting}
                  style={{
                    margin: 10,
                    fontWeight: 600,
                    padding: '5px 25px',
                    width: 320,
                    height: '50px'
                  }}
                >
                  Create your account
                </Button>
                <p>
                  Have an account already?
                  <Link href="/">
                    <a> Login here.</a>
                  </Link>
                </p>
                <p>
                  Are you a fan?
                  <Link href="/auth/register">
                    <a> Sign up here.</a>
                  </Link>
                </p>
              </Form.Item>
              {settings.enableGoogleReCaptcha && settings.googleReCaptchaSiteKey && (
              <Recaptcha
                ref={(ref) => { this.recaptcha = ref; }}
                sitekey={settings.googleReCaptchaSiteKey}
                onResolved={this.handleVerifyCapcha.bind(this)}
              />
              )}
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  settings: { ...state.settings },
  ui: { ...state.ui },
  registerPerformerData: { ...state.auth.registerPerformerData }
});

const mapDispatchToProps = { registerPerformer };

export default connect(mapStatesToProps, mapDispatchToProps)(RegisterPerformer);
