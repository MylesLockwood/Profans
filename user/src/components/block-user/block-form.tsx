import { FunctionComponent, useState } from 'react';
import {
  Button, Form, Input
} from 'antd';
import { SelectUserDropdown } from '@components/user/select-users-dropdown';

interface IProps {
  onFinish: Function;
  submiting: boolean;
  blockUserId?: string;
}

const BlockUserForm: FunctionComponent<any> = ({ onFinish, submiting, blockUserId }: IProps) => {
  const [userId, setUserId] = useState(blockUserId || '');
  return (
    <Form
      name="blockForm"
      onFinish={(values) => {
        onFinish({ ...values, targetId: userId });
      }}
      initialValues={{
        reason: 'Disturbed me'
      }}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      className="account-form"
    >
      {!blockUserId && (
      <Form.Item help="Restrict user to send message or comment on your contents">
        <SelectUserDropdown onSelect={(val) => setUserId(val)} />
      </Form.Item>
      )}
      <Form.Item
        name="reason"
        label="Reason"
      >
        <Input.TextArea maxLength={100} showCount />
      </Form.Item>
      <Form.Item>
        <Button
          className="primary"
          htmlType="submit"
          loading={submiting}
          disabled={submiting}
          style={{ marginRight: '20px' }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

BlockUserForm.defaultProps = {
  blockUserId: ''
};

export default BlockUserForm;
