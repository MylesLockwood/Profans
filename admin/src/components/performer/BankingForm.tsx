/* eslint-disable no-template-curly-in-string */
import { PureComponent } from 'react';
import {
  Form, Input, Button, Select, message
} from 'antd';
import { IBankingSetting, ICountry } from 'src/interfaces';

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
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  bankingInformation?: IBankingSetting;
  submiting?: boolean;
  countries: ICountry[];
}

export class BankingForm extends PureComponent<IProps> {
  render() {
    const {
      bankingInformation, onFinish, submiting, countries
    } = this.props;

    return (
      <Form
        {...layout}
        name="form-banking-performer"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields')}
        validateMessages={validateMessages}
        initialValues={
          bankingInformation || ({
            firstName: '',
            lastName: '',
            SSN: '',
            bankName: '',
            bankAccount: '',
            bankRouting: '',
            bankSwiftCode: '',
            address: '',
            city: '',
            state: '',
            country: ''
          } as IBankingSetting)
        }
      >
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
          >
            {countries
              && countries.length > 0
              && countries.map((country) => (
                <Select.Option key={country.code} label={country.name} value={country.code}>
                  <img src={country.flag} width="20px" alt="flag" />
                  {' '}
                  {country.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bankAccount" label="Bank Account" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bankRouting" label="Routing Number">
          <Input />
        </Form.Item>
        <Form.Item name="bankSwiftCode" label="Swift Code">
          <Input />
        </Form.Item>
        <Form.Item name="SSN" label="SSN">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="city" label="City">
          <Input />
        </Form.Item>
        <Form.Item name="state" label="State">
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
