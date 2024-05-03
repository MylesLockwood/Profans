/* eslint-disable react/destructuring-assignment */
/* eslint-disable default-case */
import { PureComponent } from 'react';
import {
  Table, Button, Tag
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { ImageProduct } from '@components/product/image-product';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteProduct?: Function;
}

export class TableListProduct extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return <ImageProduct product={record} />;
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: true
      },
      {
        title: 'Price',
        dataIndex: 'price',
        sorter: true,
        render(price: number) {
          return (
            <span>
              $
              {price.toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        sorter: true,
        render(stock: number) {
          return <span>{stock || 0}</span>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        sorter: true,
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#7b5cbd">Physical</Tag>;
            case 'digital':
              return <Tag color="#00dcff">Digital</Tag>;
          }
          return <Tag color="">{type}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        sorter: true,
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="#00c12c">Active</Tag>;
            case 'inactive':
              return <Tag color="#FFCF00">Inactive</Tag>;
          }
          return <Tag color="default">{status}</Tag>;
        }
      },
      // {
      //   title: 'Performer',
      //   dataIndex: 'performer',
      //   render(data, record) {
      //     return <span>{record.performer && record.performer.username}</span>;
      //   }
      // },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        render: (id: string) => (
          <>
            <Button className="info">
              <Link
                href={{
                  pathname: '/content-creator/my-store/update',
                  query: { id }
                }}
                as={`/content-creator/my-store/update?id=${id}`}
              >
                <a>
                  <EditOutlined />
                </a>
              </Link>
            </Button>
            <Button
              className="danger"
              onClick={() => this.props.deleteProduct(id)}
            >
              <DeleteOutlined />
            </Button>
          </>
        )
      }
    ];
    const {
      dataSource, rowKey, loading, pagination, onChange
    } = this.props;
    return (
      <div className="table-responsive">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={pagination}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
