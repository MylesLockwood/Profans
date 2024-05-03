/* eslint-disable no-template-curly-in-string */
import { PureComponent } from 'react';
import {
  Form, Input, Button, Row, Col, Select, DatePicker,
  Upload, Progress, message, Checkbox, Popover, Image
} from 'antd';
import {
  IPerformer, ICountry
} from 'src/interfaces';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import {
  UploadOutlined, TwitterOutlined, CheckCircleOutlined,
  IssuesCloseOutlined, GoogleOutlined
} from '@ant-design/icons';
import {
  HEIGHTS, ORIENTATIONS, GENDERS, BUTTS, HAIRS, BODY_TYPES, ETHNICITIES, EYES
} from 'src/constants';
import moment from 'moment';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  onVerifyEmail: Function;
  countTime: number;
  user: IPerformer;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries?: ICountry[];
}

export class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    uploadVideoPercentage: 0,
    previewVideo: null
  }

  componentDidMount() {
    const { user } = this.props;
    const { previewVideo } = this.state;
    user && user.welcomeVideoPath && this.setState({
      previewVideo: user.welcomeVideoPath
    }, () => {
      if (previewVideo) {
        const video = document.getElementById('video') as HTMLVideoElement;
        video.setAttribute('src', previewVideo);
      }
    });
  }

  handleVideoChange = (info: any) => {
    const { previewVideo } = this.state;
    info.file && info.file.percent && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success('Welcome video uploaded');
      this.setState({ isUploadingVideo: false, previewVideo: info.file.response.data && info.file.response.data.url },
        () => {
          if (previewVideo) {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', previewVideo);
          }
        });
    }
  };

  render() {
    const {
      onFinish, user, updating, countries, options,
      onVerifyEmail, countTime = 60
    } = this.props;
    const {
      uploadHeaders,
      avatarUploadUrl,
      onAvatarUploaded,
      coverUploadUrl,
      onCoverUploaded,
      videoUploadUrl
    } = options;
    const { isUploadingVideo, uploadVideoPercentage, previewVideo } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={{
          ...user,
          dateOfBirth: (user.dateOfBirth && moment(user.dateOfBirth)) || '',
          bodyType: 'slim'
        }}
        className="account-form"
      >
        <div
          className="top-profile"
          style={{
            position: 'relative',
            marginBottom: 25,
            backgroundImage:
              user?.cover
                ? `url('${user.cover}')`
                : "url('/static/banner-image.jpg')"
          }}
        >
          <div className="avatar-upload">
            <AvatarUpload
              headers={uploadHeaders}
              uploadUrl={avatarUploadUrl}
              onUploaded={onAvatarUploaded}
              image={user.avatar}
            />
          </div>
          <div className="cover-upload">
            <CoverUpload
              headers={uploadHeaders}
              uploadUrl={coverUploadUrl}
              onUploaded={onCoverUploaded}
              image={user.cover}
              options={{ fieldName: 'cover' }}
            />
          </div>
        </div>
        <Row>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="firstName"
              label="First Name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your first name!' },
                {
                  pattern: new RegExp(
                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                  ),
                  message:
                    'First name can not contain number and special character'
                }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="lastName"
              label="Last Name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your last name!' },
                {
                  pattern: new RegExp(
                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                  ),
                  message:
                    'Last name can not contain number and special character'
                }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="name"
              label="Display name"
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
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="username"
              label="Username"
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
              <Input placeholder="injoker33, shadowfiend99, etc..." />
            </Form.Item>
          </Col>
          <Col lg={24} md={24} xs={24}>
            <Form.Item
              name="email"
              label={(
                <span>
                  Email Address
                  {'  '}
                  {user.verifiedEmail ? (
                    <Popover title="Your email address is not verified" content={null}>
                      <a style={{ fontSize: 18 }}><CheckCircleOutlined /></a>
                    </Popover>
                  ) : (
                    <Popover
                      title="Your email is not verified"
                      content={(
                        <Button
                          type="primary"
                          onClick={() => onVerifyEmail()}
                          disabled={updating || countTime < 60}
                          loading={updating || countTime < 60}
                        >
                          Click here to
                          {' '}
                          {countTime < 60 ? 'resend' : 'send'}
                          {' '}
                          an email to verify your email address
                          {' '}
                          {countTime < 60 && `${countTime}s`}
                        </Button>
                      )}
                    >
                      <a style={{ fontSize: 18 }}><IssuesCloseOutlined /></a>
                    </Popover>
                  )}
                </span>
              )}
              rules={[{ type: 'email' }, { required: true, message: 'Please input your email address!' }]}
              hasFeedback
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input disabled={user.googleConnected} />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                { required: true, message: 'Please select your gender!' }]}
            >
              <Select>
                {GENDERS.map((g) => (
                  <Select.Option value={g.key} key={g.key}>
                    {g.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="sexualOrientation"
              label="Orientation"
              rules={[
                { required: true, message: 'Please select your orientation!' }
              ]}
            >
              <Select>
                {ORIENTATIONS.map((g) => (
                  <Select.Option value={g.key} key={g.key}>
                    {g.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
              >
                {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option value={c.code} label={c.name} key={c.code}>
                      <Image src={c.flag} alt="flag" fallback="/static/no-image.jpg" width={25} preview={false} />
                      {' '}
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
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
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(14, 'year').endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="state" label="State/County/Province">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="zipcode" label="Zip Code">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="ethnicity" label="Ethnicity">
              <Select>
                {ETHNICITIES.map((e) => <Option value={e.key} key={e.key}>{e.text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="height" label="Height">
              <Select showSearch>
                {HEIGHTS.map((h) => (
                  <Option key={h} value={h}>
                    {h}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="bodyType" label="Body Type">
              <Select>
                {BODY_TYPES.map((e) => <Option value={e.key} key={e.key}>{e.text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="eyes" label="Eyes color">
              <Select>
                {EYES.map((e) => <Option value={e.key} key={e.key}>{e.text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="hair" label="Hair color">
              <Select>
                {HAIRS.map((e) => <Option value={e.key} key={e.key}>{e.text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Form.Item name="butt" label="Butt size">
              <Select>
                {BUTTS.map((e) => <Option value={e.key} key={e.key}>{e.text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="bio" label="Bio">
              <TextArea rows={3} placeholder="Tell user something about you..." />
            </Form.Item>
          </Col>

          <Col lg={12} md={12} xs={24}>
            <Form.Item label="Welcome Video" help={previewVideo ? <a rel="noreferrer" href={previewVideo} target="_blank">Preview welcome video</a> : null}>
              <Upload
                accept={'video/*'}
                name="welcome-video"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={videoUploadUrl}
                headers={uploadHeaders}
                onChange={this.handleVideoChange.bind(this)}
              >
                {previewVideo ? (
                  <video
                    controls
                    id="video"
                    style={{ width: '250px', marginBottom: '10px' }}
                  />
                ) : null}
                <UploadOutlined />
              </Upload>
              {uploadVideoPercentage ? (
                <Progress percent={Math.round(uploadVideoPercentage)} />
              ) : null}
            </Form.Item>
            <Form.Item name="activateWelcomeVideo" valuePropName="checked">
              <Checkbox>Activate welcome video</Checkbox>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} xs={24}>
            {user.twitterConnected && (
              <Form.Item>
                <p>
                  <TwitterOutlined style={{ color: '#1ea2f1', fontSize: '30px' }} />
                  {' '}
                  Signup/login via Twitter
                </p>
              </Form.Item>
            )}
            {user.googleConnected && (
              <Form.Item>
                <p>
                  <GoogleOutlined style={{ color: '#d64b40', fontSize: '30px' }} />
                  {' '}
                  Signup/login via Google
                </p>
              </Form.Item>
            )}
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="primary" type="primary" htmlType="submit" loading={updating || isUploadingVideo} disabled={updating || isUploadingVideo}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
