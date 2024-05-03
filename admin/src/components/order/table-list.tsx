/* eslint-disable react/destructuring-assignment */
import { Table, Tag } from 'antd';
import {
  EyeOutlined
} from '@ant-design/icons';
import { IOrder } from 'src/interfaces';
import { formatDate } from '@lib/date';
import Link from 'next/link';

interface IProps {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
}

const OrderTableList = ({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}: IProps) => {
  const columns = [
    {
      title: 'Order number',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyerId',
      render(buyer) {
        return (
          <span>
            {`${buyer?.name || buyer?.username || 'N/A'}`}
          </span>
        );
      }
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'sellerId',
      render(seller) {
        return (
          <span>
            {`${seller?.name || seller?.username || 'N/A'}`}
          </span>
        );
      }
    },
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'productType',
      render(productType: string) {
        switch (productType) {
          case 'public_chat':
            return <Tag color="violet">Public Chat</Tag>;
          case 'private_chat':
            return <Tag color="violet">Private Chat</Tag>;
          case 'sale_post':
            return <Tag color="green">Post</Tag>;
          case 'digital_product':
            return <Tag color="red">Digital Product</Tag>;
          case 'physical_product':
            return <Tag color="red">Physical Product</Tag>;
          case 'tip_performer':
            return <Tag color="orange">Tip</Tag>;
          case 'monthly_subscription':
            return <Tag color="blue">Monthly Subscription</Tag>;
          case 'yearly_subscription':
            return <Tag color="blue">Yearly Subscription</Tag>;
          case 'free_subscription':
            return <Tag color="blue">Free Subscription</Tag>;
          default: return <Tag color="#FFCF00">{productType}</Tag>;
        }
      }
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      render(unitPrice) {
        return (
          <span>
            $
            {(unitPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render(quantity) {
        return <span>{quantity || 1}</span>;
      }
    },
    {
      title: 'Discount',
      dataIndex: 'couponInfo',
      render(couponInfo, record) {
        return couponInfo ? (
          <span style={{ whiteSpace: 'nowrap' }}>
            {`${(couponInfo.value || 0) * 100}%`}
            {' '}
            - $
            {((record?.originalPrice || 0) * couponInfo.value).toFixed(2)}
          </span>
        ) : (
          ''
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
      title: 'Payment Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'refunded':
            return <Tag color="red">Refunded</Tag>;
          case 'created':
            return <Tag color="gray">Created</Tag>;
          case 'paid':
            return <Tag color="blue">Paid</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Delivery Status',
      dataIndex: 'deliveryStatus',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="gray">Created</Tag>;
          case 'processing':
            return <Tag color="#FFCF00">Processing</Tag>;
          case 'shipping':
            return <Tag color="#00dcff">Shipping</Tag>;
          case 'delivered':
            return <Tag color="#00c12c">Delivered</Tag>;
          case 'refunded':
            return <Tag color="red">Refunded</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Updated at',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render(id: string) {
        return <Link href={{ pathname: '/order/detail', query: { id } }}><a><EyeOutlined /></a></Link>;
      }
    }
  ];
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      rowKey={rowKey}
      loading={loading}
      onChange={onChange.bind(this)}
    />
  );
};
export default OrderTableList;
