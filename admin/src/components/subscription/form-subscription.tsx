import { PureComponent, createRef } from 'react';
import {
  Form, Button, Select, DatePicker, message
} from 'antd';
import { ISubscriptionCreate } from 'src/interfaces';
import { FormInstance } from 'antd/lib/form';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { userService } from '@services/user.service';
import moment from 'moment';

const { Option } = Select;
interface IProps {
  onFinish: Function;
  submitting?: boolean;
}
function disabledDate(current) {
  return current && current < moment().endOf('day');
}
export class FormSubscription extends PureComponent<IProps> {
  formRef: any;

  timeout = 0;

  state = {
    users: []
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { onFinish, submitting } = this.props;
    const { users } = this.state;
    const handleSearch = async (value: string) => {
      try {
        if (this.timeout) clearTimeout(this.timeout);
        // await this.setState({ searching: true });
        this.timeout = window.setTimeout(async () => {
          const result = await userService.search({
            q: value,
            limit: 5,
            sortBy: 'updatedAt',
            sort: 'desc'
          });
          this.setState({ users: result.data.data });
        }, 300);
      } catch (error) {
        message.error('An error occurred, please try again!');
        // await this.setState({ searching: false });
      }
    };
    return (
      <Form
        ref={this.formRef}
        onFinish={onFinish.bind(this)}
        initialValues={
          {
            subscriptionType: 'free',
            userId: '',
            performerId: '',
            status: 'active',
            expiredAt: ''
          } as ISubscriptionCreate
        }
        layout="vertical"
      >
        <Form.Item name="subscriptionType" label="Type" rules={[{ required: true, message: 'Please select type!' }]}>
          <Select>
            <Select.Option key="free" value="free">
              Free
            </Select.Option>
            <Select.Option key="monthly" value="monthly" disabled>
              Monthly
            </Select.Option>
            <Select.Option key="yearly" value="yearly" disabled>
              Yearly
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="userId" label="User" rules={[{ required: true }]}>
          <Select
            showSearch
            defaultActiveFirstOption={false}
            showArrow
            onSearch={handleSearch}
            onChange={(val) => this.setFormVal('userId', val)}
            notFoundContent={null}
            allowClear
          >
            {users.map((u) => (
              <Option key={u._id} value={u._id}>
                <span>
                  <strong>{u.username}</strong>
                  {' '}
                  /
                  <span>{u.name}</span>
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="performerId" label="Performer" rules={[{ required: true }]}>
          <SelectPerformerDropdown onSelect={(val) => this.setFormVal('performerId', val)} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="expiredAt"
          label="Expried Date"
          rules={[{ required: true, message: 'Please input select expried date of subscription!' }]}
        >
          <DatePicker format="YYYY-MM-DD" disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
