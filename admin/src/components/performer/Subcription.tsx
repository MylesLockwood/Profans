import { PureComponent } from 'react';
import {
  Form, Button, message, InputNumber, Switch
} from 'antd';
import { IPerformerUpdate, IPerformerCreate } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

interface IProps {
  onFinish: Function;
  performer?: IPerformerUpdate;
  submiting?: boolean;
  ref?: Function;
}

export class SubscriptionForm extends PureComponent<IProps> {
  state = {
    isFreeSubscription: false
  }

  componentDidMount() {
    const { performer } = this.props;
    this.setState({ isFreeSubscription: performer.isFreeSubscription });
  }

  render() {
    const { performer, onFinish, submiting } = this.props;
    const { isFreeSubscription } = this.state;
    return (
      <Form
        {...layout}
        name="form-performer"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields in tab general info')}
        validateMessages={validateMessages}
        initialValues={
          performer || (({
            isFreeSubscription: false,
            yearlyPrice: 99.99,
            monthlyPrice: 9.99
          } as unknown) as IPerformerCreate)
        }
      >
        <Form.Item name="isFreeSubscription" valuePropName="checked">
          <Switch unCheckedChildren="Set Price For Subcription" checkedChildren="Subscribe For Free" checked={isFreeSubscription} onChange={() => this.setState({ isFreeSubscription: !isFreeSubscription })} />
        </Form.Item>
        {!isFreeSubscription && (
        <>
          <Form.Item
            key="yearly"
            name="yearlyPrice"
            label="Yearly Subscription Price"
            rules={[{ required: true }]}
            help="Value is from $1.00"
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            key="monthly"
            name="monthlyPrice"
            label="Monthly Subscription Price"
            rules={[{ required: true }]}
            help="Value is from $1.00"
          >
            <InputNumber min={1} />
          </Form.Item>
        </>
        )}
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
