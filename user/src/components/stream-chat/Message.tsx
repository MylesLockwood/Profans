import React from 'react';
import moment from 'moment';
import { EllipsisOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import '@components/messages/Message.less';

interface IProps {
  data: any;
  isMine: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
  showTimestamp: boolean;
  isOwner: boolean;
  canDelete: boolean;
  onDelete: Function;
  openBlockUser: Function;
}

export default function Message(props: IProps) {
  const {
    data,
    isMine,
    startsSequence,
    endsSequence,
    showTimestamp,
    isOwner,
    canDelete,
    onDelete,
    openBlockUser
  } = props;
  const friendlyTimestamp = moment(data.createdAt).format('LLLL');
  const menu = (
    <Menu>
      {isOwner && (
      <Menu.Item key="block" onClick={() => openBlockUser(data?.senderInfo)}>
        Block
      </Menu.Item>
      )}
      <Menu.Item key="delete" onClick={() => onDelete()}>
        Delete
      </Menu.Item>
    </Menu>
  );
  return (
    <div
      className={[
        'message',
        `${isMine || isOwner ? 'mine' : ''}`,
        `${startsSequence ? 'start' : ''}`,
        `${endsSequence ? 'end' : ''}`
      ].join(' ')}
    >
      {data.text && !data.isSystem && (
        <div className={isOwner ? 'bubble-container owner' : 'bubble-container'}>
          <div className="bubble" title={friendlyTimestamp}>
            {canDelete && (
              <Dropdown overlay={menu} placement="topRight">
                <span>
                  <EllipsisOutlined />
                  {' '}
                </span>
              </Dropdown>
            )}
            {data?.senderInfo && (
              <span className="u-name">
                {data?.senderInfo?.name || data?.senderInfo?.username || 'N/A'}
                {data.type !== 'tip' ? ': ' : ' '}
              </span>
            )}
            {!data.imageUrl && data.text}
            {' '}
            {data.imageUrl && (
              <a
                title="Click to view full content"
                href={
                  data.imageUrl.indexOf('http') === -1 ? '#' : data.imageUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                <img src={data.imageUrl} width="180px" alt="" />
              </a>
            )}
          </div>
        </div>
      )}
      {data.text && data.isSystem && (
        <p style={{ textAlign: 'center', fontSize: '10px' }}>{data.text}</p>
      )}
      {showTimestamp && !data.isSystem && (
        <div className="timestamp">{friendlyTimestamp}</div>
      )}
    </div>
  );
}
