import { PureComponent } from 'react';
import {
  Form, InputNumber, Button, Row, Col, Switch, Alert
} from 'antd';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export class PerformerSubscriptionForm extends PureComponent<IProps> {
  state = {
    isFreeSubscription: false
  }

  componentDidMount() {
    const { user } = this.props;
    this.setState({ isFreeSubscription: user.isFreeSubscription });
  }

  render() {
    const { onFinish, user, updating } = this.props;
    const { isFreeSubscription } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          // eslint-disable-next-line no-param-reassign
          values.isFreeSubscription = isFreeSubscription;
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col xl={12} md={12} xs={24}>
            <Form.Item>
              <Switch unCheckedChildren="Non-free Subscription" checkedChildren="Free Subcription" checked={isFreeSubscription} onChange={() => this.setState({ isFreeSubscription: !isFreeSubscription })} />
            </Form.Item>
            {!isFreeSubscription ? (
              <>
                <Form.Item name="monthlyPrice" label="Monthly Subscription Price">
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item name="yearlyPrice" label="Yearly Subscription Price">
                  <InputNumber min={1} />
                </Form.Item>
              </>
            ) : <Alert type="warning" message="User is free to access your contents!" />}
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item name="publicChatPrice" label="Default public chat price">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="privateChatPrice" label="Minimum private chat price">
              <InputNumber min={1} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="primary" type="primary" htmlType="submit" disabled={updating} loading={updating}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
