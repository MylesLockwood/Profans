import { PureComponent } from 'react';
import {
  Form, Button, message, InputNumber
} from 'antd';
import { ICommissionSetting } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

interface IProps {
  onFinish: Function;
  commissionSetting?: ICommissionSetting;
  submiting?: boolean;
}

export class CommissionSettingForm extends PureComponent<IProps> {
  render() {
    const { commissionSetting, onFinish, submiting } = this.props;
    return (
      <Form
        layout="vertical"
        name="form-performer"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields.')}
        validateMessages={validateMessages}
        initialValues={
          commissionSetting || ({
            monthlySubscriptionCommission: 0.1,
            yearlySubscriptionCommission: 0.1,
            videoSaleCommission: 0.1,
            productSaleCommission: 0.1,
            publicChatCommission: 0.1,
            privateChatCommission: 0.1,
            feedSaleCommission: 0.1,
            referralCommission: 0.05
          })
        }
      >
        <Form.Item name="monthlySubscriptionCommission" label="Monthly Subscription" help="Value is from 0.01 - 0.99 (1% - 99%)">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="yearlySubscriptionCommission" label="Yearly Subscription">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="publicChatCommission" label="Public Chat commission">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="privateChatCommission" label="Private Chat commission">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="tipCommission" label="Tip commission">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="feedSaleCommission" label="Post for sale commission">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="productSaleCommission" label="Product for sale commission">
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="referralCommission" label="Referral commission">
          <InputNumber min={0} max={0.99} style={{ width: '100%' }} />
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
