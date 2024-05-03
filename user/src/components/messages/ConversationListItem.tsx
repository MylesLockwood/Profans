import { Badge } from 'antd';
import './ConversationListItem.less';

interface IProps {
  data: any;
  setActive: Function;
  selected: boolean;
}

export default function ConversationListItem(props: IProps) {
  const { data, setActive, selected } = props;
  const {
    recipientInfo, lastMessage, _id, totalNotSeenMessages = 0
  } = data;
  const className = selected
    ? 'conversation-list-item active'
    : 'conversation-list-item';

  return (
    <div aria-hidden className={className} onClick={() => setActive(_id)}>
      <div className="conversation-left-corner">
        <img className="conversation-photo" src={recipientInfo?.avatar || '/static/no-avatar.png'} alt="conversation" />
        <span className={recipientInfo?.isOnline ? 'online' : 'offline'} />
      </div>
      <div className="conversation-info">
        <h1 className="conversation-title">{recipientInfo?.name || recipientInfo?.username || 'N/A'}</h1>
        <p className="conversation-snippet">{lastMessage}</p>
        {/* <p className="conversation-time">{moment(lastMessageCreatedAt ? lastMessageCreatedAt : updatedAt).fromNow()}</p> */}
      </div>
      <Badge
        className="notification-badge"
        count={totalNotSeenMessages}
      />
    </div>
  );
}
