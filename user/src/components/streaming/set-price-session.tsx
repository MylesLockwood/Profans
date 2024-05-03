import { PureComponent } from 'react';
import {
  InputNumber, Button, Form, Input
} from 'antd';
import { IPerformer } from '@interfaces/index';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  user: IPerformer;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
  streamType: string;
  price?: number;
  conversationDescription?: any;
}

export default class StreamPriceForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, submiting = false, performer,
      streamType, conversationDescription, price
    } = this.props;
    return (
      <div>
        <Form
          {...layout}
          name="nest-messages"
          onFinish={onFinish.bind(this)}
          initialValues={{
            name: conversationDescription || '',
            price: streamType === 'private' ? performer.privateChatPrice : price
          }}
          className="account-form"
        >
          {streamType === 'private' && <p>Add your budget to ensure content creator accept your call request!</p>}
          {streamType === 'public' && (
          <Form.Item
            name="name"
            label="Update conversation description here"
          >
            <Input />
          </Form.Item>
          )}
          <Form.Item
            name="price"
            label="Price"
            help={streamType === 'private' ? `Content creator require minimum price is $${performer.privateChatPrice}` : null}
          >
            <InputNumber style={{ width: '100%' }} min={streamType === 'private' ? performer.privateChatPrice : 1} />
          </Form.Item>
          {streamType === 'private' && (
          <Form.Item
            name="userNote"
            label="Note"
            help="Note something to content creator"
          >
            <Input.TextArea allowClear maxLength={150} rows={2} showCount />
          </Form.Item>
          )}
          <Form.Item>
            <Button className="primary" type="primary" htmlType="submit" loading={submiting} disabled={submiting}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
