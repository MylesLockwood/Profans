/* eslint-disable prefer-promise-reject-errors */
import React from 'react';
import {
  Form, Button, Input, Row, Col
} from 'antd';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onFinish: Function;
  updating: boolean;
}

export const UpdatePaswordForm = ({ onFinish, updating = false }: IProps) => (
  <Form name="nest-messages" className="account-form" onFinish={onFinish.bind(this)} {...layout}>
    <Row>
      <Col md={12} xs={24}>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            {
              pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g),
              message: 'Password must have minimum 8 characters, at least one uppercase letter, one lowercase letter and one number'
            }
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item
          label="Confirm Password"
          name="confirm"
          validateTrigger={['onChange', 'onBlur']}
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!'
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match together!');
              }
            })
          ]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
      </Col>
    </Row>
    <Form.Item wrapperCol={{ offset: 4 }}>
      <Button className="primary" htmlType="submit" loading={updating}>
        Save Password
      </Button>
    </Form.Item>
  </Form>
);
