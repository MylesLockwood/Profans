import { useState } from 'react';
import {
  Form,
  Button,
  Input,
  Space,
  Statistic,
  Tag,
  Alert,
  DatePicker
} from 'antd';
import {
  IPayoutRequest
} from 'src/interfaces/payout-request';
import Router from 'next/router';
import moment from 'moment';

interface Props {
  submit: Function;
  submiting: boolean;
  payout: Partial<IPayoutRequest>;
  statsPayout: {
    totalEarnings: number;
    previousPaidOut: number;
    remainingUnpaid: number;
  };
  onSelectDateRange: Function;
}

const PayoutRequestForm = ({
  payout, submit, submiting, statsPayout, onSelectDateRange
}: Props) => {
  const [form] = Form.useForm();
  const {
    requestNote, fromDate, toDate, status, paymentAccountType
  } = payout;
  const [dateRange, setDate] = useState({
    fromDate: fromDate ? moment(fromDate) : moment().subtract(30, 'days'),
    toDate: toDate ? moment(toDate) : moment()
  });

  return (
    <Form
      form={form}
      layout="vertical"
      className="payout-request-form"
      name="payoutRequestForm"
      onFinish={(data) => {
        const payload = { ...data, ...dateRange };
        payload.requestPrice = statsPayout?.remainingUnpaid || 0;
        submit(payload);
      }}
      initialValues={{
        requestNote: requestNote || '',
        paymentAccountType: paymentAccountType || 'paypal'
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <Space size="large">
          <Statistic
            title="Total profit"
            value={statsPayout?.totalEarnings || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Previous paid out"
            value={statsPayout?.previousPaidOut || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Request value"
            value={statsPayout?.remainingUnpaid || 0}
            precision={2}
            prefix="$"
          />
        </Space>
      </div>
      <Form.Item label="Select date range">
        <DatePicker.RangePicker
          disabled={payout && payout.status !== 'pending'}
          value={[dateRange.fromDate, dateRange.toDate] as any}
          onChange={(dates: [any, any]) => {
            setDate({
              fromDate: dates[0],
              toDate: dates[1]
            });
            onSelectDateRange({
              fromDate: dates[0],
              toDate: dates[1]
            });
          }}
        />
      </Form.Item>
      <Form.Item label="Note to Admin" name="requestNote">
        <Input.TextArea disabled={payout && payout.status === 'done'} placeholder="Text something to admin here" rows={3} />
      </Form.Item>
      {payout?.adminNote && (
      <Form.Item label="Admin noted">
        <Alert type="info" message={payout?.adminNote} />
      </Form.Item>
      )}
      {payout._id && (
      <Form.Item label="Status">
        <Tag color="orange" style={{ textTransform: 'capitalize' }}>{status}</Tag>
      </Form.Item>
      )}
      {/* <Form.Item label="Select payout method" name="paymentAccountType">
        <Select>
          <Select.Option value="stripe" key="stripe">
            <img src="/static/stripe-icon.jpeg" width="30px" alt="stripe" />
            {' '}
            Stripe
          </Select.Option>
          <Select.Option value="paypal" key="paypal">
            <img src="/static/paypal-ico.png" width="30px" alt="paypal" />
            {' '}
            Paypal
          </Select.Option>
        </Select>
      </Form.Item> */}
      <Form.Item>
        <Button
          className="primary"
          loading={submiting}
          htmlType="submit"
          disabled={(payout && payout.status !== 'pending') || submiting}
          style={{ margin: '0 5px' }}
        >
          Submit
        </Button>
        <Button
          className="secondary"
          loading={submiting}
          htmlType="button"
          disabled={submiting}
          style={{ margin: '0 5px' }}
          onClick={() => Router.back()}
        >
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

PayoutRequestForm.defaultProps = { };

export default PayoutRequestForm;
