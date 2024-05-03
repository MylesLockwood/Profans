import { useState, useEffect } from 'react';
import { Tabs, Button, message } from 'antd';
import StreamMessenger from '@components/stream-chat/Messenger';
import { IUser } from 'src/interfaces';
import { getResponseError } from '@lib/utils';
import { messageService } from 'src/services';
import StreamingChatUsers from './streaming-chat-view';
import './chat-box.less';

interface IProps {
  resetAllStreamMessage?: Function;
  user?: any;
  activeConversation?: any;
  totalParticipant?: number;
  members?: IUser[];
  hideMember: boolean;
}

const checkPermission = (performer, conversation) => {
  if (performer && conversation && conversation.data && performer._id === conversation.data.performerId) {
    return true;
  }

  return false;
};

const ChatBox = ({
  resetAllStreamMessage,
  user,
  activeConversation,
  totalParticipant,
  members,
  hideMember = false
}: IProps) => {
  const [removing, setRemoving] = useState(false);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    setCanReset(checkPermission(user, activeConversation));
  }, [user, activeConversation]);

  const removeAllMessage = async () => {
    if (!canReset) {
      return;
    }

    try {
      setRemoving(true);
      if (!window.confirm('Are you sure you want to remove chat history?')) {
        return;
      }
      await messageService.deleteAllMessageInConversation(
        activeConversation.data._id
      );
      resetAllStreamMessage && resetAllStreamMessage({ conversationId: activeConversation.data._id });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className={hideMember ? 'conversation-stream active' : 'conversation-stream'}>
        <Tabs defaultActiveKey="chat_content">
          <Tabs.TabPane tab="CHAT" key="chat_content">
            {activeConversation
            && activeConversation.data
            && activeConversation.data.streamId ? (
              <StreamMessenger />
              ) : <p className="text-center">Let start a converstion</p>}
          </Tabs.TabPane>
          {!hideMember && (
          <Tabs.TabPane tab={`USER (${totalParticipant || 0})`} key="chat_user">
            <StreamingChatUsers members={members} />
          </Tabs.TabPane>
          )}
        </Tabs>
      </div>
      {canReset && (
      <div style={{ margin: '10px' }}>
        <Button
          type="primary"
          loading={removing}
          onClick={() => removeAllMessage()}
        >
          Clear all message history
        </Button>
      </div>
      )}
    </>
  );
};

ChatBox.defaultProps = {
  totalParticipant: 0,
  members: [],
  activeConversation: null,
  user: null,
  resetAllStreamMessage: null
};

export default ChatBox;
