import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import { formatDate } from '@lib/date';

interface IProps {
  dataSource: any[];
  pagination: {
    total: number;
    pageSize: number;
    current: number;
  };
  loading: boolean;
  onChange: Function;
}

export class TableReferralEarning extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: 'Register',
        dataIndex: 'registerInfo',
        render(registerInfo) {
          return (
            <span>
              {registerInfo?.name || registerInfo?.username || 'N/A'}
            </span>
          );
        }
      },
      {
        title: 'Referral',
        dataIndex: 'referralInfo',
        render(referralInfo) {
          return (
            <span>
              {referralInfo?.name || referralInfo?.username || 'N/A'}
            </span>
          );
        }
      },
      {
        title: 'Payment type',
        dataIndex: 'sourceType',
        render(sourceType: string) {
          switch (sourceType) {
            case 'performer':
              return <Tag color="red">Subscription</Tag>;
            case 'video':
              return <Tag color="#FFCF00">VOD</Tag>;
            case 'performer_product':
              return <Tag color="blue">Store</Tag>;
            default: return <Tag color="#936dc9">{sourceType}</Tag>;
          }
        }
      },
      {
        title: 'GROSS',
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
        title: 'NET',
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
        title: 'Commission',
        dataIndex: 'referralCommission',
        render(referralCommission: number) {
          return (
            <span>
              {referralCommission * 100}
              %
            </span>
          );
        }
      },
      {
        title: 'Paid status',
        dataIndex: 'isPaid',
        render(isPaid: boolean) {
          switch (isPaid) {
            case true:
              return <Tag color="green">Paid</Tag>;
            case false:
              return <Tag color="orange">Pending</Tag>;
            default: return null;
          }
        }
      },
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
      dataSource, pagination, onChange, loading
    } = this.props;
    return (
      <div className="table-responsive">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total
          }}
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
