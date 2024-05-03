import { Table, Tag, Tooltip } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { ISubscription } from 'src/interfaces';
import { formatDate, formatDateNoTime } from '@lib/date';

interface IProps {
  dataSource: ISubscription[];
  pagination: {};
  rowKey: string;
  onChange(): Function;
  loading: boolean;
  onCancelSubscriber: Function;
}

export const TableListSubscription = ({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  onCancelSubscriber
}: IProps) => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            {`${records.userInfo.firstName} ${records.userInfo.lastName}`}
            <br />
            {' '}
            {records.userInfo.email}
          </span>
        );
      }
    },
    {
      title: 'Model',
      dataIndex: 'performerInfo',
      render(data, records) {
        return (
          <span>
            {`${records.performerInfo.firstName} ${records.performerInfo.lastName}`}
            {' '}
            <br />
            {' '}
            {records.performerInfo.email}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="orange">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="purple">Yearly Subscription</Tag>;
          case 'system':
            return <Tag color="red">System</Tag>;
          default: return <Tag color="orange">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Expired Date',
      dataIndex: 'expiredAt',
      render(date: Date) {
        return <span>{formatDateNoTime(date)}</span>;
      }
    },
    {
      title: 'Next Reccuring Date',
      dataIndex: 'expiredAt',
      render(data, records) {
        return <span>{records?.expiredAt ? formatDateNoTime(records.expiredAt) : 'N/A'}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Deactivated</Tag>;
          default: return <Tag color="red">Deactivated</Tag>;
        }
      }
    },
    {
      title: 'Last Update',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: 'status',
      render(data, records) {
        return (
          <span>
            {records?.status === 'active' ? (
              <Tooltip placement="top" title="Deactive">
                <StopOutlined onClick={() => onCancelSubscriber(records._id)} />
              </Tooltip>
            ) : null}
          </span>
        );
      }
    }
  ];
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={pagination}
      onChange={onChange}
      loading={loading}
    />
  );
};
