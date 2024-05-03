import { PureComponent, createRef } from 'react';
import {
  Spin, message, Modal, Button
} from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadMoreMessages } from '@redux/message/actions';
import BlockUserForm from '@components/block-user/block-form';
import { blockService } from '@services/block.service';
import { IUser } from '@interfaces/user';
import Compose from './Compose';
import Message from './Message';
import './MessageList.less';

interface IProps {
  sendMessage: any;
  loadMoreMessages: Function;
  messageState: any;
  conversation: any;
  currentUser: IUser;
}

class MessageList extends PureComponent<IProps> {
  messagesRef: any;

  state = {
    offset: 0,
    openBlockModal: false,
    submiting: false,
    blockUser: null
  }

  async componentDidMount() {
    if (!this.messagesRef) this.messagesRef = createRef();
  }

  async componentDidUpdate(prevProps) {
    const { conversation, messageState, sendMessage } = this.props;
    if (prevProps.conversation && prevProps.conversation._id !== conversation._id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ offset: 0 });
    }
    if ((prevProps.messageState.total === 0 && messageState.total !== 0) || (prevProps.messageState.total === messageState.total)) {
      if (prevProps.sendMessage?.data?._id !== sendMessage?.data?._id) {
        this.scrollToBottom(true);
        return;
      }
      this.scrollToBottom(false);
    }
  }

  async handleScroll(conversation, event) {
    const { messageState, loadMoreMessages: handleLoadMore } = this.props;
    const { offset } = this.state;
    const { fetching, items, total } = messageState;
    const canloadmore = total > items.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      this.setState({ offset: offset + 1 },
        () => {
          const { offset: newOffset } = this.state;
          handleLoadMore({ conversationId: conversation._id, limit: 25, offset: newOffset * 25 });
        });
    }
  }

 renderMessages = () => {
   const { messageState, currentUser, conversation } = this.props;
   const recipientInfo = conversation && conversation.recipientInfo;
   const messages = messageState.items;
   let i = 0;
   const messageCount = messages.length;
   const tempMessages = [];
   while (i < messageCount) {
     const previous = messages[i - 1];
     const current = messages[i];
     const next = messages[i + 1];
     const isMine = current.senderId === currentUser._id;
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
           key={i}
           isMine={isMine}
           startsSequence={startsSequence}
           endsSequence={endsSequence}
           showTimestamp={showTimestamp}
           data={current}
           recipient={recipientInfo}
           currentUser={currentUser}
         />
       );
     }
     // Proceed to the next message.
     i += 1;
   }
   return tempMessages;
 };

 scrollToBottom(toBot = true) {
   const { messageState: { fetching } } = this.props;
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
     message.error('Please select a user');
     return;
   }
   try {
     await this.setState({ submiting: true });
     await blockService.blockUser({ targetId, target: 'user', reason: data.reason || '' });
     message.success('Blocked successfully');
   } catch (e) {
     const err = await e;
     message.error(err?.message || 'An error occured, please try again later');
   } finally {
     this.setState({ submiting: false, openBlockModal: false });
   }
 }

 render() {
   const { conversation, messageState, currentUser } = this.props;
   const { fetching } = messageState;
   const { openBlockModal, submiting, blockUser } = this.state;
   return (
     <div className="message-list" ref={this.messagesRef} onScroll={this.handleScroll.bind(this, conversation)}>
       {conversation && conversation._id
         ? (
           <>
             <div className="message-list-container">
               <div className="mess-recipient">
                 <span>
                   <img alt="" src={conversation?.recipientInfo?.avatar || '/static/no-avatar.png'} />
                   {' '}
                   {conversation?.recipientInfo?.name || conversation?.recipientInfo?.username || 'N/A'}
                 </span>
                 {currentUser.isPerformer && <Button className="danger" onClick={() => this.setState({ openBlockModal: true, blockUser: conversation?.recipientInfo })}>Block</Button>}
               </div>
               {fetching && <div className="text-center"><Spin /></div>}
               {this.renderMessages()}
               {!conversation.isSubscribed && <div className="sub-text">Please subscribe to this content creator to start the conversation</div>}
             </div>
           </>
         )
         : <p className="text-center">Click on conversation to start</p>}
       <Compose conversation={conversation} disabled={!conversation?.isSubscribed} />
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

const mapStates = (state: any) => {
  const { conversationMap, sendMessage } = state.message;
  const { activeConversation } = state.conversation;
  const messages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].items || []
    : [];
  const totalMessages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].total || 0
    : 0;
  const fetching = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].fetching || false : false;
  return {
    sendMessage,
    messageState: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation,
    currentUser: state.user.current
  };
};

const mapDispatch = { loadMoreMessages };
export default connect(mapStates, mapDispatch)(MessageList);
