import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { sendStreamMessage } from '@redux/stream-chat/actions';
import { Input, message, Popover } from 'antd';
import {
  SendOutlined, SmileOutlined
} from '@ant-design/icons';
import { Emotions } from '@components/messages/emotions';
import '@components/messages/Compose.less';

const { TextArea } = Input;
interface IProps {
  loggedIn: boolean;
  sendStreamMessage: Function;
  sentFileSuccess?: Function;
  sendMessageStatus: any;
  conversation: any;
}

class Compose extends PureComponent<IProps> {
  _input: any;

  state = { text: '' };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps: IProps) {
    const { sendMessageStatus } = this.props;
    if (sendMessageStatus.success && previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
      this.updateMessage('');
      this._input && this._input.focus();
    }
  }

  onKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this.send();
    }
  };

  onChange = (evt) => {
    this.setState({ text: evt.target.value });
  };

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.updateMessage(text + emojiObject.emoji);
  }

  updateMessage(text: string) {
    this.setState({ text });
  }

  send() {
    const { loggedIn, sendStreamMessage: _sendStreamMessage, conversation } = this.props;
    const { text } = this.state;
    if (!loggedIn) {
      message.error('Please login');
      return;
    }
    if (!text) {
      return;
    }

    _sendStreamMessage({
      conversationId: conversation._id,
      data: {
        text
      },
      type: conversation.type
    });
  }

  render() {
    const { loggedIn } = this.props;
    const { text } = this.state;
    const { sendMessageStatus: status } = this.props;
    if (!this._input) this._input = createRef();
    return (
      <div className="compose custom">
        <TextArea
          value={text}
          className="compose-input"
          placeholder="Enter message here."
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={!loggedIn || status.sending}
          autoFocus
          // eslint-disable-next-line no-return-assign
          ref={(ref) => (this._input = ref)}
          rows={1}
        />
        <div className="grp-icons custom">
          <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
            <div className="grp-emotions">
              <SmileOutlined />
            </div>
          </Popover>
          <SendOutlined onClick={this.send.bind(this)} />
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  loggedIn: state.auth.loggedIn,
  sendMessageStatus: state.streamMessage.sendMessage
});

const mapDispatch = { sendStreamMessage };
export default connect(mapStates, mapDispatch)(Compose);
