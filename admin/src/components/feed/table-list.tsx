import { PureComponent } from 'react';
import {
  Table, Tag
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { DropdownAction } from '@components/common/dropdown-action';

interface IProps {
    dataSource: [];
    rowKey: string;
    loading: boolean;
    pagination: {};
    onChange: Function;
    deleteFeed?: Function;
}
export class TableListFeed extends PureComponent<IProps> {
  render() {
    const { deleteFeed } = this.props;
    const columns = [
      {
        title: 'Performer',
        dataIndex: 'name',
        render(data, record) {
          return <span>{record.performer && record.performer.name}</span>;
        }

      },
      {
        title: 'Description',
        dataIndex: 'text',
        sorter: true,
        render(data, record) {
          return (
            <div style={{
              whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '300px'
            }}
            >
              {record.text}
            </div>
          );
        }

      },
      {
        title: 'Type',
        dataIndex: 'type',
        sorter: true,
        render(type) {
          switch (type) {
            case 'video':
              return <Tag color="#dc3545">Video</Tag>;
            case 'photo':
              return <Tag color="orange">Photo</Tag>;
            case 'text':
              return <Tag color="#FFCF00">Text</Tag>;
            default: return <Tag color="#936dc9">{type}</Tag>;
          }
        }
      },
      {
        title: 'For Sale?',
        dataIndex: 'isSale',
        sorter: true,
        render(data, record) {
          if (!record.isSale) {
            return <Tag color="red">No</Tag>;
          }
          return <Tag color="green">Yes</Tag>;
        }
      },
      {
        title: 'Price',
        dataIndex: 'price',
        sorter: true,
        render(price: number) {
          return <span>{price || null}</span>;
        }
      },
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
          <DropdownAction
            menuOptions={[
              {
                key: 'update',
                name: 'Update',
                children: (
                  <Link
                    href={{
                      pathname: '/feed/update',
                      query: { id }
                    }}
                    as={`/feed/update?id=${id}`}
                  >
                    <a>
                      <EditOutlined />
                      {' '}
                      Update
                    </a>
                  </Link>
                )
              },
              {
                key: 'delete',
                name: 'Delete',
                children: (
                  <span>
                    <DeleteOutlined />
                    {' '}
                    Delete
                  </span>
                ),
                onClick: () => deleteFeed(id)
              }
            ]}
          />
        )
      }
    ];
    const {
      dataSource, rowKey, loading, pagination, onChange
    } = this.props;
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
      />
    );
  }
}
