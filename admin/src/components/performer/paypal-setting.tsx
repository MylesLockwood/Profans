import { PureComponent } from 'react';
import {
  Form, Input, Button, message
} from 'antd';
import { IPaymentGatewaySetting } from 'src/interfaces';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

interface IProps {
  onFinish: Function;
  paypalSetting?: IPaymentGatewaySetting;
  submiting?: boolean;
}

export class PaypalSettingForm extends PureComponent<IProps> {
  render() {
    const { paypalSetting, onFinish, submiting } = this.props;
    return (
      <Form
        // {...layout}
        layout="vertical"
        name="form-performer"
        onFinish={(data) => onFinish(data, 'paypal')}
        onFinishFailed={() => message.error('Please complete the required fields.')}
        validateMessages={validateMessages}
        initialValues={
          paypalSetting
            ? {
              ...paypalSetting.value
            }
            : ({
              emailAddress: ''
            })
        }
      >

        <Form.Item
          name="emailAddress"
          label="Paypal email address"
          rules={[
            { required: true, message: 'Please your Paypal email address' },
            { type: 'email', message: 'Please enter valid email address' }]}
        >
          <Input type="email" placeholder="Paypal email address" />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol }}>
          <Button type="primary" htmlType="submit" loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
