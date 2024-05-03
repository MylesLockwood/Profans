import React from 'react';
import { Table, Tag } from 'antd';
import { ITransaction } from 'src/interfaces';
import { formatDate } from '@lib/date';

interface IProps {
  dataSource: ITransaction[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
}

const PaymentTableList = ({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}: IProps) => {
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {orderNumber}
          </span>
        );
      }
    },
    {
      title: 'Model',
      dataIndex: 'seller',
      key: 'seller',
      render(seller, record) {
        return (
          <span>
            {record?.seller?.name || record?.seller?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render(type: string) {
        switch (type) {
          case 'free_subscription': return <Tag color="blue">Free Subscription</Tag>;
          case 'monthly_subscription': return <Tag color="blue">Monthly Subscription</Tag>;
          case 'yearly_subscription': return <Tag color="blue">Yearly Subscription</Tag>;
          case 'private_chat': return <Tag color="pink">Private Chat</Tag>;
          case 'public_chat': return <Tag color="pink">Public Chat</Tag>;
          case 'performer_post': return <Tag color="red">Post</Tag>;
          case 'tip_performer': return <Tag color="orange">Tip</Tag>;
          case 'performer_product': return <Tag color="green">Product</Tag>;
          default: return <Tag>{type}</Tag>;
        }
      }
    },
    {
      title: 'Original price',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render(originalPrice) {
        return (
          <span>
            $
            {(originalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Discount',
      dataIndex: 'couponInfo',
      render(couponInfo, record) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {record?.couponInfo && `${(record?.couponInfo.value || 0) * 100}%`}
          </span>
        );
      }
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      render(totalPrice) {
        return (
          <span>
            $
            {(totalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'paid':
            return <Tag color="success">Paid</Tag>;
          case 'pending':
            return <Tag color="warning">Pending</Tag>;
          case 'created':
            return <Tag color="gray">Created</Tag>;
          case 'refunded':
            return <Tag color="danger">Refunded</Tag>;
          case 'deliveried':
            return <Tag color="orange">Deliveried</Tag>;
          default: break;
        }
        return <Tag color="default">{status}</Tag>;
      }
    },
    {
      title: 'Purchased at',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
      />
    </div>
  );
};
export default PaymentTableList;
