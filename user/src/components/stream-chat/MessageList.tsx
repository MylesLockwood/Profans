import { PureComponent, createRef } from 'react';
import { Spin, message as notify, Modal } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  loadMoreStreamMessages,
  receiveStreamMessageSuccess,
  deleteMessage,
  deleteMessageSuccess
} from '@redux/stream-chat/actions';
import { SocketContext } from 'src/socket';
import { IUser } from 'src/interfaces';
import BlockUserForm from '@components/block-user/block-form';
import { blockService } from '@services/block.service';
import '@components/messages/MessageList.less';
import Compose from './Compose';
import Message from './Message';

interface IProps {
  sendMessage: any;
  loadMoreStreamMessages: Function;
  receiveStreamMessageSuccess: Function;
  message: any;
  conversation: any;
  user: IUser;
  deleteMessage: Function;
  deleteMessageSuccess: Function;
}

const canDelete = ({ isDeleted, senderId, performerId }, user): boolean => {
  if (isDeleted) return false;
  let check = false;
  if (user && user._id) {
    if (user.roles && user.roles.includes('admin')) {
      check = true;
    } if (senderId === user._id) {
      check = true;
    } if (performerId === user._id) {
      check = true;
    }
  }
  return check;
};

class MessageList extends PureComponent<IProps> {
  messagesRef: any;

  state = {
    offset: 0,
    submiting: false,
    openBlockModal: false,
    blockUser: null
  };

  async componentDidMount() {
    if (!this.messagesRef) this.messagesRef = createRef();
    const { conversation } = this.props;
    const socket = this.context;
    if (conversation && conversation._id) {
      socket
        && socket.on
        && socket.on(
          `message_created_conversation_${conversation._id}`,
          (data) => {
            this.onMessage(data, 'created');
          }
        );
      socket
        && socket.on
        && socket.on(
          `message_deleted_conversation_${conversation._id}`,
          (data) => {
            this.onMessage(data, 'deleted');
          }
        );
    }
  }

  async componentDidUpdate(prevProps) {
    const { message, sendMessage } = this.props;
    if ((prevProps.message.total === 0 && message.total !== 0) || (prevProps.message.total === message.total)) {
      if (prevProps.sendMessage?.data?._id !== sendMessage?.data?._id) {
        this.scrollToBottom(true);
        return;
      }
      this.scrollToBottom(false);
    }
  }

  componentWillUnmount() {
    const { conversation } = this.props;
    const socket = this.context;
    socket && socket.off(`message_created_conversation_${conversation._id}`);
    socket && socket.off(`message_deleted_conversation_${conversation._id}`);
  }

  async handleScroll(conversation, event) {
    const {
      message: { fetching, items, total },
      loadMoreStreamMessages: loadMore
    } = this.props;
    const { offset } = this.state;
    const canloadmore = total > items.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      await this.setState({ offset: offset + 1 });
      loadMore({
        conversationId: conversation._id,
        limit: 25,
        offset: (offset + 1) * 25,
        type: conversation.type
      });
    }
  }

  onDelete(messageId) {
    const { deleteMessage: _deleteMessage } = this.props;
    if (!messageId) return;
    _deleteMessage({ messageId });
  }

  renderMessages = () => {
    const { message, conversation, user } = this.props;
    const messages = message.items;
    let i = 0;
    const messageCount = messages && messages.length;
    const tempMessages = [];
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = user && current.senderId === user._id;
      const currentMoment = moment(current.createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;
      if (previous) {
        const previousMoment = moment(previous.createdAt);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.senderId === current.senderId;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdAt);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.senderId === current.senderId;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }
      if (current._id) {
        tempMessages.push(
          <Message
            onDelete={this.onDelete.bind(this, current._id)}
            canDelete={canDelete({ ...current, performerId: conversation.performerId }, user)}
            isOwner={conversation.performerId === current.senderId}
            key={i}
            isMine={isMine}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            showTimestamp={showTimestamp}
            data={current}
            openBlockUser={(blockUser) => this.setState({ openBlockModal: true, blockUser })}
          />
        );
      }
      // Proceed to the next message.
      i += 1;
    }
    return tempMessages;
  };

  onMessage = (message, type) => {
    if (!message) {
      return;
    }

    const { receiveStreamMessageSuccess: create, deleteMessageSuccess: remove } = this.props;
    type === 'created' && create(message);
    type === 'deleted' && remove(message);
  };

  scrollToBottom(toBot = true) {
    const { message: { fetching } } = this.props;
    const { offset } = this.state;
    if (!fetching && this.messagesRef && this.messagesRef.current) {
      const ele = this.messagesRef.current;
      window.setTimeout(() => {
        ele.scrollTop = toBot ? ele.scrollHeight : (ele.scrollHeight / (offset + 1) - 150);
      }, 300);
    }
  }

  async blockUser(data: any) {
    const { targetId } = data;
    if (!targetId) {
      notify.error('Please select a user');
      return;
    }
    try {
      await this.setState({ submiting: true });
      await blockService.blockUser({ targetId, target: 'user', reason: data.reason || '' });
      notify.success('Blocked successfully');
    } catch (e) {
      const err = await e;
      notify.error(err?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openBlockModal: false });
    }
  }

  render() {
    const { conversation } = this.props;
    const { blockUser, openBlockModal, submiting } = this.state;
    const {
      message: { fetching }
    } = this.props;
    return (
      <div
        className="message-list"
        ref={this.messagesRef}
        onScroll={this.handleScroll.bind(this, conversation)}
      >
        <div className="message-list-container">
          {fetching && <div className="text-center"><Spin /></div>}
          {this.renderMessages()}
        </div>
        <Compose conversation={conversation} />
        <Modal
          title={`Block ${blockUser?.name || blockUser?.username || 'user'}`}
          visible={openBlockModal}
          onCancel={() => this.setState({ openBlockModal: false })}
          footer={null}
          destroyOnClose
        >
          <BlockUserForm blockUserId={blockUser?._id} onFinish={this.blockUser.bind(this)} submiting={submiting} />
        </Modal>
      </div>
    );
  }
}

MessageList.contextType = SocketContext;

const mapStates = (state: any) => {
  const { conversationMap, activeConversation, sendMessage } = state.streamMessage;
  const messages = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].items || []
    : [];
  const totalMessages = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].total || 0
    : 0;
  const fetching = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].fetching || false
    : false;
  return {
    sendMessage,
    message: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation.data,
    user: state.user.current
  };
};

const mapDispatch = {
  loadMoreStreamMessages,
  receiveStreamMessageSuccess,
  deleteMessage,
  deleteMessageSuccess
};
export default connect(mapStates, mapDispatch)(MessageList);
