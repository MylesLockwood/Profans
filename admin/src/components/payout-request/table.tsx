/* eslint-disable react/destructuring-assignment */
import { Table, Tag, Button } from 'antd';
import Link from 'next/link';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { IPayoutRequest } from 'src/interfaces';
import { formatDate } from 'src/lib';

interface IProps {
  payouts: IPayoutRequest[];
  searching: boolean;
  total: number;
  pageSize: number;
  onChange: Function;
  onDelete: Function;
}

const PayoutRequestList = ({
  payouts,
  searching,
  total,
  pageSize,
  onChange,
  onDelete
}: IProps) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: 'id',
      render: (id: string, record) => (
        <Link
          href={{
            pathname: '/referral-program/payout-requests/detail',
            query: {
              data: JSON.stringify(record),
              id: record._id
            }
          }}
          as={`/referral-program/payout-request/detail?id=${record._id}`}
        >
          <a>
            {record._id.slice(16, 24).toUpperCase()}
          </a>
        </Link>
      )
    },
    {
      title: 'From date',
      key: 'fromDate',
      dataIndex: 'fromDate',
      render: (fromDate: Date) => <span>{formatDate(fromDate, 'LL')}</span>
    },
    {
      title: 'To date',
      key: 'toDate',
      dataIndex: 'toDate',
      render: (toDate: Date) => <span>{formatDate(toDate, 'LL')}</span>
    },
    {
      title: 'Requested value',
      dataIndex: 'requestPrice',
      key: 'requestPrice',
      render: (requestPrice: number) => (
        <span>
          $
          {(requestPrice || 0).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Payout Gateway',
      dataIndex: 'paymentAccountType',
      key: 'paymentAccountType',
      render: (paymentAccountType: string) => {
        switch (paymentAccountType) {
          case 'banking':
            return <Tag color="#656fde">Banking</Tag>;
          case 'paypal':
            return <Tag color="#25397c">Paypal</Tag>;
          default:
            break;
        }
        return <Tag color="default">{paymentAccountType}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'done':
            return <Tag color="green" style={{ textTransform: 'capitalize' }}>Done</Tag>;
          case 'pending':
            return <Tag color="orange" style={{ textTransform: 'capitalize' }}>Pending</Tag>;
          case 'rejected':
            return <Tag color="red" style={{ textTransform: 'capitalize' }}>Rejected</Tag>;
          default: break;
        }
        return <Tag color="blue" style={{ textTransform: 'capitalize' }}>{status}</Tag>;
      }
    },
    {
      title: 'Last updated at',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (updatedAt: Date) => <span>{formatDate(updatedAt, 'LL')}</span>,
      sorter: true
    },
    {
      title: 'Actions',
      key: 'details',
      render: (request: IPayoutRequest) => (
        <>
          <Link
            href={{
              pathname: '/referral-program/payout-requests/detail',
              query: {
                data: JSON.stringify(request),
                id: request._id
              }
            }}
            as={`/referral-program/payout-request/detail?id=${request._id}`}
          >
            <a><EditOutlined /></a>
          </Link>
          <Button disabled={request.status !== 'pending'} type="link" onClick={() => onDelete(request)}>
            <a><DeleteOutlined /></a>
          </Button>
        </>
      )
    }
  ];
  const dataSource = payouts.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize
      }}
      showSorterTooltip={false}
      loading={searching}
      onChange={onChange.bind(this)}
    />
  );
};
PayoutRequestList.defaultProps = {};
export default PayoutRequestList;
