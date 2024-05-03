import React from 'react';
import { Form, Button, InputNumber } from 'antd';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface Iprops {
  onFinish : Function,
  balance: number,
  updating: boolean
}

export const UpdateBalanceForm = ({ onFinish, balance, updating = false }: Iprops) => (
  <Form
    name="nest-messages"
    onFinish={onFinish.bind(this)}
    {...layout}
    initialValues={{
      balance
    }}
  >
    <Form.Item
      name="balance"
      label="Balance"
      rules={[
        { required: true, message: 'Enter balance you want to update!' }
      ]}
    >
      <InputNumber />
    </Form.Item>
    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
      <Button type="primary" htmlType="submit" loading={updating}>
        Update
      </Button>
    </Form.Item>
  </Form>
);
