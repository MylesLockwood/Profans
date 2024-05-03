import { PureComponent } from 'react';
import {
  Form, Input, Button, message
} from 'antd';
import { CCBillPaymentGateway } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

interface IProps {
  onFinish: Function;
  ccbillSetting?: any;
  submiting?: boolean;
}

export class CCbillSettingForm extends PureComponent<IProps> {
  render() {
    const { ccbillSetting, onFinish, submiting } = this.props;
    return (
      <Form
        // {...layout}
        layout="vertical"
        name="form-performer"
        onFinish={(data) => onFinish(data, 'ccbill')}
        onFinishFailed={() => message.error('Please complete the required fields.')}
        validateMessages={validateMessages}
        initialValues={
          ccbillSetting
            ? {
              ...ccbillSetting.value
            }
            : ({
              subscriptionSubAccountNumber: '',
              singlePurchaseSubAccountNumber: ''
            } as CCBillPaymentGateway)
        }
      >

        <Form.Item
          name="subscriptionSubAccountNumber"
          label="Subscription sub-account number"
          rules={[{ required: true, message: 'Please enter subscription sub account number' }]}
        >
          <Input placeholder="Enter subscription sub-account number" />
        </Form.Item>
        <Form.Item
          name="singlePurchaseSubAccountNumber"
          label="Single purchase sub-account number"
          rules={[{ required: true, message: 'Please enter single purchase  sub account number' }]}
        >
          <Input placeholder="Enter single purchase sub-account number" />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol }}>
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
