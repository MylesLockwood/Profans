import { Table, Button, Tooltip } from 'antd';
import '../../../pages/content-creator/restrict-user/index.less';
import { formatDate } from '@lib/date';

interface IProps {
  items: any[];
  searching: boolean;
  total: number;
  pageSize: number;
  onPaginationChange: Function;
  unblockUser: Function;
  submiting: boolean;
}

const UsersBlockList = ({
  items,
  searching,
  total,
  pageSize,
  onPaginationChange,
  unblockUser,
  submiting
}: IProps) => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'targetInfo',
      key: 'targetInfo',
      // eslint-disable-next-line react/destructuring-assignment
      render: (targetInfo: any) => <span>{targetInfo?.name || targetInfo?.username || 'N/A'}</span>
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: any) => (
        <Tooltip title={reason}>
          <div style={{
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}
          >
            {reason}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
      sorter: true
    },
    {
      title: 'Actions',
      key: '_id',
      render: (item) => (
        <Button
          className="unblock-user"
          type="primary"
          disabled={submiting}
          onClick={() => unblockUser(item.targetId)}
        >
          Unblock
        </Button>
      )
    }
  ];
  const dataSource = items.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize
      }}
      scroll={{ x: true }}
      loading={searching}
      onChange={onPaginationChange.bind(this)}
    />
  );
};
UsersBlockList.defaultProps = {};
export default UsersBlockList;
