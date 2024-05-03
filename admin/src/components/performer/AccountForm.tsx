import { PureComponent } from 'react';
import {
  Form, Input, Button, Select, message, Switch, Row, Col, DatePicker
} from 'antd';
import {
  IPerformerUpdate,
  ICountry,
  ILangguges,
  IPhoneCodes,
  IPerformerCategory
} from 'src/interfaces';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { authService, performerService } from '@services/index';
import moment from 'moment';
import {
  HAIRS, HEIGHTS, EYES, ETHNICITIES, BODY_TYPES, BUTTS, GENDERS, ORIENTATIONS
} from 'src/contants';
import './index.less';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

const { TextArea } = Input;

interface IProps {
  onFinish: Function;
  onUploaded: Function;
  performer?: IPerformerUpdate;
  submiting?: boolean;
  countries: ICountry[];
  languages?: ILangguges[];
  phoneCodes?: IPhoneCodes[];
  categories?: IPerformerCategory[];
  avatarUrl?: string;
  coverUrl?: string;
}

export class AccountForm extends PureComponent<IProps> {
  render() {
    const {
      performer, onFinish, submiting, countries, onUploaded,
      avatarUrl, coverUrl
    } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Form
        {...layout}
        name="form-performer"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields in tab basic info')}
        validateMessages={validateMessages}
        initialValues={
          { ...performer, dateOfBirth: moment(performer?.dateOfBirth) || '' } || ({
            country: 'US',
            status: 'active',
            gender: 'male',
            sexualOrientation: 'female',
            languages: ['en'],
            bodyType: 'slim',
            dateOfBirth: '',
            verifiedEmail: false,
            verifiedAccount: false,
            verifiedDocument: false
          })
        }
      >
        <Row>
          <Col xs={12} md={12}>
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
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
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
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
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
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true },
                {
                  pattern: new RegExp(/^[a-zA-Z0-9]+$/g),
                  message: 'Username must contain only Alphabets & Numbers'
                }, { min: 3 }]}
            >
              <Input placeholder="Unique, lowercase and number, no space or special chars" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
              <Input placeholder="Email address" />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
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
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select>
                {GENDERS.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="sexualOrientation" label="Orientation">
              <Select>
                {ORIENTATIONS.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { min: 9 },
                { max: 14 },
                {
                  pattern: /^[0-9\b\\+ ]+$/,
                  message: 'The phone number is not in the correct format'
                }
              ]}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* {categories && categories.length > 0 && (
          <Form.Item
            name="categoryIds"
            label="Categories"
            rules={[
              {
                type: 'array'
              }
            ]}
          >
            <Select mode="multiple">
              {categories.map((cat) => (
                <Select.Option key={cat.slug} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )} */}
          {!performer && [
            <Col xs={12} md={12}>
              <Form.Item key="password" name="password" label="Password" rules={[{ required: true }, { min: 6 }]}>
                <Input.Password placeholder="Performer password" />
              </Form.Item>
            </Col>,
            <Col xs={12} md={12}>
              <Form.Item
                key="rePassword"
                name="rePassword"
                label="Confirm password"
                rules={[{ required: true }, { min: 6 }]}
              >
                <Input.Password placeholder="Confirm performer password" />
              </Form.Item>
            </Col>
          ]}
          <Col xs={12} md={12}>
            <Form.Item name="country" label="Country" rules={[{ required: true }]}>
              <Select showSearch>
                {countries.map((country) => (
                  <Select.Option key={country.code} value={country.code}>
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="state" label="State/County/Provice">
              <Input placeholder="Enter the state/county/province" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="city" label="City">
              <Input placeholder="Enter the city" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter the address" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="zipcode" label="Zipcode">
              <Input placeholder="Enter the zipcode" />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="ethnicity" label="Ethnicity">
              <Select>
                {ETHNICITIES.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="bodyType" label="Body Type">
              <Select>
                {BODY_TYPES.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="height" label="Height">
              <Select showSearch>
                {HEIGHTS.map((g) => <Select.Option value={g} key={g}>{g}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col xs={12} md={12}>
            <Form.Item name="weight" label="Weight">
              <Select showSearch>
                {weights
              && weights.map((w: IWeight) => (
                <Option key={w.text} value={w.text}>
                  {w.text}
                </Option>
              ))}
              </Select>
            </Form.Item>
          </Col> */}
          <Col xs={12} md={12}>
            <Form.Item name="eyes" label="Eyes">
              <Select>
                {EYES.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="hair" label="Hair">
              <Select>
                {HAIRS.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col xs={12} md={12}>
            <Form.Item name="pubicHair" label="Pubic Hair">
              <Select>
                <Option key="trimmed" value="trimmed">
                  Trimmed
                </Option>
                <Option key="shaved" value="shaved">
                  Shaved
                </Option>
                <Option key="hairy" value="hairy">
                  Hairy
                </Option>
              </Select>
            </Form.Item>
          </Col> */}
          <Col xs={12} md={12}>
            <Form.Item name="butt" label="Butt size">
              <Select>
                {BUTTS.map((g) => <Select.Option value={g.key} key={g.key}>{g.text}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="bio" label="Bio">
              <TextArea rows={3} />
            </Form.Item>
          </Col>

          {/* <Form.Item
          name="languages"
          label="Languages"
          rules={[
            {
              type: 'array'
            }
          ]}
        >
          <Select mode="multiple">
            {languages.map((l) => (
              <Select.Option key={l.code} value={l.code}>
                {l.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}
          <Col xs={24} md={24}>
            <div
              className="top-profile"
              style={{
                position: 'relative',
                marginBottom: 25,
                backgroundImage:
                  coverUrl
                    ? `url('${coverUrl}')`
                    : "url('/banner-image.jpg')"
              }}
            >
              <div className="avatar-upload">
                <AvatarUpload
                  headers={uploadHeaders}
                  uploadUrl={performerService.getAvatarUploadUrl()}
                  onUploaded={onUploaded.bind(this, 'avatarId')}
                  image={avatarUrl}
                />
              </div>
              <div className="cover-upload">
                <CoverUpload
                  options={{ fieldName: 'cover' }}
                  image={performer && performer.cover ? performer.cover : ''}
                  headers={uploadHeaders}
                  uploadUrl={performerService.getCoverUploadUrl()}
                  onUploaded={onUploaded.bind(this, 'coverId')}
                />
              </div>
            </div>
          </Col>
          <Col xs={8} md={8}>
            <Form.Item name="verifiedEmail" help="Verified email status" label="Verified Email" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={8} md={8}>
            <Form.Item name="verifiedDocument" help="Verified ID document status" label="Verified ID Documents" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={8} md={8}>
            <Form.Item name="verifiedAccount" help="Display check icon beside display name on FE" label="Verified Account" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
                <Select.Option key="pending-email-confirmation" value="pending-email-confirmation" disabled>
                  Pending email confirmation
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
              <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
                Submit
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
