/* eslint-disable default-case */
import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import { formatDate } from '@lib/date';
import { IEarning } from 'src/interfaces';

interface IProps {
  dataSource: IEarning[];
  rowKey: string;
  pagination: any;
  onChange: Function;
  loading: boolean;
}

export class TableListEarning extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: 'User',
        dataIndex: 'userInfo',
        render(userInfo) {
          return (
            <span>
              {userInfo?.name || userInfo?.username || 'N/A'}
            </span>
          );
        }
      },
      {
        title: 'Type',
        dataIndex: 'sourceType',
        render(sourceType: string) {
          switch (sourceType) {
            case 'private_chat':
              return <Tag color="violet">Private Chat</Tag>;
            case 'public_chat':
              return <Tag color="violet">Public Chat</Tag>;
            case 'performer':
              return <Tag color="red">Subscription</Tag>;
            case 'performer_product':
              return <Tag color="blue">Store</Tag>;
            case 'performer_post':
              return <Tag color="green">Post</Tag>;
            case 'tip_performer':
              return <Tag color="orange">Tip</Tag>;
          }
          return <Tag color="#936dc9">{sourceType}</Tag>;
        }
      },
      {
        title: 'GROSS',
        dataIndex: 'netPrice',
        render(netPrice: number) {
          return (
            <span>
              $
              {netPrice.toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'NET',
        dataIndex: 'grossPrice',
        render(grossPrice: number) {
          return (
            <span>
              $
              {grossPrice.toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Commission',
        dataIndex: 'commission',
        render(commission: number) {
          return (
            <span>
              {commission * 100}
              %
            </span>
          );
        }
      },
      // {
      //   title: 'Status',
      //   dataIndex: 'isPaid',
      //   sorter: true,
      //   render(isPaid: boolean) {
      //     switch (isPaid) {
      //       case true:
      //         return <Tag color="green">Paid</Tag>;
      //       case false:
      //         return <Tag color="orange">Pending</Tag>;
      //     }
      //   }
      // },
      // {
      //   title: 'Paid At',
      //   dataIndex: 'paidAt',
      //   sorter: true,
      //   render(date: Date) {
      //     return <span>{date ? formatDate(date) : null}</span>;
      //   }
      // },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      }
    ];
    const {
      dataSource, rowKey, pagination, onChange, loading
    } = this.props;
    return (
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          pagination={pagination}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
