import { PureComponent } from 'react';
import { connect } from 'react-redux';
import MessageList from './MessageList';
import '@components/messages/Messenger.less';

interface IProps {
  activeConversation?: any;
}
class StreamMessenger extends PureComponent<IProps> {
  render() {
    const { activeConversation } = this.props;
    return (
      <div className="message-stream">
        {activeConversation && activeConversation.data && activeConversation.data.streamId ? <MessageList /> : <p>No conversation found.</p>}
      </div>
    );
  }
}
const mapStates = (state: any) => ({
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatchs = { };
export default connect(mapStates, mapDispatchs)(StreamMessenger);
