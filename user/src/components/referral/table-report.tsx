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

export class TableReferralReport extends PureComponent<IProps> {
  render() {
    const {
      dataSource, pagination, onChange, loading
    } = this.props;
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
        title: 'Commission',
        dataIndex: 'commission',
        render(commission) {
          return (
            <span>
              {commission}
              %
            </span>
          );
        }
      },
      {
        title: 'Register type',
        dataIndex: 'registerSource',
        render(registerSource) {
          switch (registerSource) {
            case 'performer':
              return <Tag color="blue">Content creator</Tag>;
            case 'user':
              return <Tag color="orange">User</Tag>;
            default: return null;
          }
        }
      },
      {
        title: 'Date',
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
