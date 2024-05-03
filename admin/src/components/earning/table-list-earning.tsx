import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import { formatDate } from '@lib/date';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
}

export class TableListEarning extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: 'Content Creator',
        dataIndex: 'performerInfo',
        key: 'performer',
        render(performerInfo) {
          return (
            <div>
              {performerInfo?.name || performerInfo?.username || 'N/A'}
            </div>
          );
        }
      },
      {
        title: 'User',
        dataIndex: 'userInfo',
        key: 'user',
        render(userInfo) {
          return (
            <div>
              {userInfo?.name || userInfo?.username || 'N/A'}
            </div>
          );
        }
      },
      {
        title: 'Total earned',
        dataIndex: 'grossPrice',
        sorter: true,
        render(grossPrice) {
          return (
            <span>
              $
              {(grossPrice || 0).toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Net price',
        dataIndex: 'netPrice',
        sorter: true,
        render(netPrice) {
          return (
            <span>
              $
              {(netPrice || 0).toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Commission',
        dataIndex: 'commission',
        sorter: true,
        render(commission) {
          return (
            <span>
              {(commission || 0) * 100}
              %
            </span>
          );
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        sorter: true,
        render(type: string) {
          switch (type) {
            case 'monthly_subscription':
              return <Tag color="#936dc9">Monthly Subscription</Tag>;
            case 'yearly_subscription':
              return <Tag color="#936dc9">Yearly Subscription</Tag>;
            case 'free_subscription':
              return <Tag color="#936dc9">Free Subscription</Tag>;
            case 'digital_product':
              return <Tag color="#FFCF00">Digital Product</Tag>;
            case 'physical_product':
              return <Tag color="#FFCF00">Physical Product</Tag>;
            case 'performer_post':
              return <Tag color="green">Post</Tag>;
            case 'tip_performer':
              return <Tag color="#00dcff">Tip</Tag>;
            default: return <Tag color="#00dcff">{type}</Tag>;
          }
        }
      },
      // {
      //   title: 'Paid status',
      //   dataIndex: 'isPaid',
      //   sorter: true,
      //   render(isPaid: boolean) {
      //     switch (isPaid) {
      //       case true:
      //         return <Tag color="green">Paid</Tag>;
      //       case false:
      //         return <Tag color="red">Unpaid</Tag>;
      //     }
      //   }
      // },
      // {
      //   title: 'Paid at',
      //   dataIndex: 'paidAt',
      //   sorter: true,
      //   render(paidAt: Date) {
      //     return <span>{formatDate(paidAt)}</span>;
      //   }
      // },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(createdAt: Date) {
          return <span>{formatDate(createdAt)}</span>;
        }
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
