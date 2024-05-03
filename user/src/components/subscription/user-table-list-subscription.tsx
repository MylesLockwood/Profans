import { Table, Tag } from 'antd';
import { ISubscription } from 'src/interfaces';
import { formatDate } from '@lib/date';

interface IProps {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange(): Function;
  loading: boolean;
}

export const TableListSubscription = ({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading
}: IProps) => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return <span>{records?.userInfo?.username || 'N/A'}</span>;
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="#936dc9">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="#00dcff">Yearly Subscription</Tag>;
          case 'free':
            return <Tag color="#FFCF00">Free Subscription</Tag>;
          default: return <Tag color="#FFCF00">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Expired Date',
      dataIndex: 'expiredAt',
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Updated Date',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="#00c12c">Active</Tag>;
          case 'deactivated':
            return <Tag color="#FFCF00">Inactive</Tag>;
          default:
            return <Tag color="pink">{status}</Tag>;
        }
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
      />
    </div>
  );
};
