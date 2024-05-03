import { PureComponent } from 'react';
import { Tooltip, Button } from 'antd';
import { } from '@ant-design/icons';
import { formatDateFromnow } from '@lib/index';
import { StreamSettings } from '@interfaces/index';
import Router from 'next/router';
import './index.less';

interface IProps {
  request: any;
  settings: StreamSettings;
  onDecline: Function;
}

export class PrivateCallCard extends PureComponent<IProps> {
  render() {
    const { request, settings, onDecline } = this.props;
    const {
      user, userNote, price, createdAt
    } = request;
    return (
      <div className="private-call-card">
        <div className="user-info">
          <img alt="p-avt" src={(user?.avatar) || '/static/no-avatar.png'} />
          <div className="user-name">
            <span>{user?.name || 'N/A'}</span>
            <small>
              @
              {user?.username || 'n/a'}
            </small>
          </div>
        </div>
        {userNote && (
        <Tooltip title={userNote}>
          <p className="user-note">{userNote}</p>
        </Tooltip>
        )}
        <div className="date-time">{formatDateFromnow(createdAt)}</div>
        <span className="price">
          $
          {price.toFixed(2)}
        </span>
        <div style={{ display: 'flex' }}>
          <Button
            block
            className="success"
            onClick={() => Router.push({
              pathname: `/content-creator/live/${
                settings.optionForPrivate === 'webrtc'
                  ? 'webrtc/'
                  : ''
              }privatechat`,
              query: { id: request.conversationId }
            }, `/content-creator/live/${
              settings.optionForPrivate === 'webrtc'
                ? 'webrtc/'
                : ''
            }privatechat/${request.conversationId}`)}
          >
            Accept
          </Button>
          <Button className="error" block onClick={() => onDecline(request.conversationId)}>Decline</Button>
        </div>
      </div>
    );
  }
}
