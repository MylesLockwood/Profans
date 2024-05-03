import { PureComponent, createRef } from 'react';
import { Popover } from 'antd';
import { connect } from 'react-redux';
import { sendMessage, sentFileSuccess } from '@redux/message/actions';
import { SmileOutlined, SendOutlined } from '@ant-design/icons';
import { ImageMessageUpload } from '@components/messages/uploadPhoto';
import { authService, messageService } from '@services/index';
import { Emotions } from './emotions';
import './Compose.less';

interface IProps {
  sendMessage: Function;
  sentFileSuccess: Function;
  sendMessageStatus: any;
  conversation: any;
  currentUser: any;
  disabled: boolean;
}

class Compose extends PureComponent<IProps> {
  _input: any;

  state = { text: '' };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps) {
    const { sendMessageStatus } = this.props;
    if (previousProps?.sendMessageStatus?.success !== sendMessageStatus?.success) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ text: '' });
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
    this.setState({ text: text + emojiObject.emoji });
  }

  onPhotoUploaded = (data: any) => {
    if (!data || !data.response) {
      return;
    }
    const { sentFileSuccess: handleSendFile } = this.props;
    const imageUrl = (data.response.data && data.response.data.imageUrl) || data.base64;
    handleSendFile({ ...data.response.data, ...{ imageUrl } });
  }

  send() {
    const { sendMessage: handleSendMessage, disabled } = this.props;
    const { text } = this.state;
    if (!text || disabled) return;
    const { conversation } = this.props;
    handleSendMessage({
      conversationId: conversation._id,
      data: {
        text
      }
    });
  }

  render() {
    const { text } = this.state;
    const {
      sendMessageStatus: status, conversation, currentUser, disabled
    } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    if (!this._input) this._input = createRef();
    return (
      <div className="compose">
        <textarea
          value={text}
          className="compose-input"
          placeholder="Write your message..."
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={status.sending || !conversation._id || disabled}
          ref={(c) => { this._input = c; }}
        />
        <div className="grp-icons">
          <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
            <div className="grp-emotions">
              <SmileOutlined />
            </div>
          </Popover>
        </div>

        <div className="grp-icons">
          <div className="grp-file-icon">
            <ImageMessageUpload
              disabled={status.sending || !conversation._id || disabled}
              headers={uploadHeaders}
              uploadUrl={messageService.getMessageUploadUrl()}
              onUploaded={this.onPhotoUploaded}
              options={{ fieldName: 'message-photo' }}
              messageData={{
                text: 'sent a photo',
                conversationId: conversation && conversation._id,
                recipientId: conversation && conversation.recipientInfo && conversation.recipientInfo._id,
                recipientType: currentUser && currentUser.isPerformer ? 'user' : 'performer'
              }}
            />
          </div>
        </div>
        <div className="grp-icons" style={{ paddingRight: 0 }}>
          <div aria-hidden className="grp-send" onClick={this.send.bind(this)}>
            <SendOutlined />
          </div>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  sendMessageStatus: state.message.sendMessage,
  currentUser: state.user.current
});

const mapDispatch = { sendMessage, sentFileSuccess };
export default connect(mapStates, mapDispatch)(Compose);
