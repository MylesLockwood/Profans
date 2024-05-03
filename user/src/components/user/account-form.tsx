/* eslint-disable react/require-default-props */
import {
  Form, Input, Button, Select, Col, Row, Popover
} from 'antd';
import { AvatarUpload } from '@components/user/avatar-upload';
import { IUser, IUserFormData } from 'src/interfaces';
import {
  TwitterOutlined, CheckCircleOutlined, IssuesCloseOutlined, GoogleOutlined
} from '@ant-design/icons';

interface UserAccountFormIProps {
  user: IUser;
  updating: boolean;
  onFinish(data: IUserFormData): Function;
  options?: {
    uploadHeader: any;
    avatarUrl: string;
    uploadAvatar(): Function;
  };
  onVerifyEmail: Function;
  countTime: number;
  onSwitchToPerformer: Function;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export const UserAccountForm = ({
  updating,
  onFinish,
  user,
  options,
  onVerifyEmail,
  countTime = 60,
  onSwitchToPerformer
}: UserAccountFormIProps) => (
  <Form
    className="account-form"
    {...layout}
    name="user-account-form"
    onFinish={onFinish}
    initialValues={user}
  >
    <Row>
      <Col xs={24} sm={12}>
        <Form.Item
          hasFeedback
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
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item
          hasFeedback
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
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please input your username!' },
            {
              pattern: new RegExp(/^[a-zA-Z0-9]+$/g),
              message:
                'Username must contain alphanumeric only'
            },
            { min: 3, message: 'Username must containt at least 3 characters' }
          ]}
          hasFeedback
        >
          <Input placeholder="mirana, inVOker123, etc..." />
        </Form.Item>
        <Form.Item
          name="email"
          label={(
            <span>
              Email Address
              {'  '}
              {user.verifiedEmail ? (
                <Popover title="Your email address is verified" content={null}>
                  <a style={{ fontSize: 18 }}><CheckCircleOutlined /></a>
                </Popover>
              ) : (
                <Popover
                  title="Your email address is not verified"
                  content={(
                    <Button
                      type="primary"
                      onClick={() => onVerifyEmail()}
                      disabled={!user.email || updating || countTime < 60}
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
          <Input disabled={user.googleConnected} placeholder="Email Address" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
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
          <Input placeholder="Display name" />
        </Form.Item>
        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: 'Please select gender!' }]}
        >
          <Select>
            <Select.Option value="male" key="male">
              Male
            </Select.Option>
            <Select.Option value="female" key="female">
              Female
            </Select.Option>
            <Select.Option value="transgender" key="transgender">
              Trans
            </Select.Option>
            <Select.Option value="genderfluid" key="genderfluid">
              Genderfluid
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Avatar">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div>
              <AvatarUpload
                image={user.avatar}
                uploadUrl={options.avatarUrl}
                headers={options.uploadHeader}
                onUploaded={options.uploadAvatar}
              />
            </div>
          </div>
        </Form.Item>
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
    <Form.Item className="text-center">
      <Button htmlType="submit" className="primary" disabled={updating} loading={updating}>
        Update Profile
      </Button>
      {user.email && user.username && <Button className="secondary" disabled={updating} loading={updating} onClick={() => onSwitchToPerformer()}>Become a content creator & start earning money</Button>}
    </Form.Item>
  </Form>
);
