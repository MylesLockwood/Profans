/* eslint-disable no-console */
import { PureComponent, createRef } from 'react';
import Header from 'next/head';
import {
  Row, Col, message, Button
} from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import Router, { Router as RouterEvent } from 'next/router';
import { IPerformer, StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import { connect } from 'react-redux';
import { accessPrivateRequest } from 'src/redux/streaming/actions';
import { SocketContext, Event } from 'src/socket';
import ChatBox from '@components/stream-chat/chat-box';
import {
  getStreamConversationSuccess,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import PrivateHlsPublisher from '@components/streaming/hls/private/publisher';
import PrivateHlsSubscriber from '@components/streaming/hls/private/subscriber';
import { getResponseError, videoDuration } from '@lib/index';
import './index.less';

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  PRIVATE_CHAT_PAYMENT_SUCCESS = 'private-chat-payment-success',
  PRIVATE_CHAT_DECLINE = 'private-chat-decline'
}

const STREAM_JOINED = 'private-stream/streamJoined';
const STREAM_LEAVED = 'private-stream/streamLeaved';
const JOINED_THE_ROOM = 'JOINED_THE_ROOM';

interface IProps {
  id: string;
  user: IPerformer;
  isStreaming: boolean;
  setStreaming: Function;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  accessPrivateRequest: Function;
  updateBalance: Function;
  settings: StreamSettings;
}

interface IStates {
  processing: boolean;
  roomJoined: boolean;
  total?: number;
  callTime: number;
  subscriberStreamId: string;
}

class ModelPrivateChat extends PureComponent<IProps, IStates> {
  static layout = 'stream';

  static authenticate = true;

  static onlyPerformer = true;

  private publisherRef;

  private subscriberRef;

  private streamId: string;

  private socket: any;

  private _intervalCallTime: NodeJS.Timeout;

  private requestSession: any;

  static async getInitialProps({ ctx }) {
    if (!ctx.query.id) {
      if (process.browser) {
        return Router.back();
      }

      ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/home' });
      ctx.res.end && ctx.res.end();
      return { ctx };
    }
    return { id: ctx.query.id };
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      subscriberStreamId: '',
      processing: false,
      roomJoined: false,
      total: 0,
      callTime: 0
    };
  }

  componentDidMount() {
    const { id } = this.props;
    if (!id) {
      Router.back();
      return;
    }
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.on('routeChangeStart', this.onbeforeunload.bind(this));
    this.publisherRef = createRef();
    this.subscriberRef = createRef();
    this.acceptRequest();
    this.initSocketEvent();
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  onbeforeunload = () => {
    this.leaveSession();
  }

  initSocketEvent() {
    this.socket = this.context;
    this.socket.on(
      JOINED_THE_ROOM,
      ({ streamId, conversationId, streamList }) => {
        const { activeConversation } = this.props;
        if (conversationId !== activeConversation.data._id) return;
        const subscriberStreamId = streamList && streamList.find((id) => id !== streamId);
        subscriberStreamId && this.setState({ subscriberStreamId });
        this.streamId = streamId;
        conversationId && this.publisherRef.current && this.publisherRef.current.start(conversationId);
        streamId && this.publisherRef.current && this.publisherRef.current.publish(streamId);
      }
    );
    this.socket.on(STREAM_JOINED, ({ streamId, conversationId }) => {
      const { activeConversation } = this.props;
      if (conversationId !== activeConversation.data._id) return;
      if (this.streamId !== streamId) {
        this.setState({ subscriberStreamId: streamId });
      }
    });
    this.socket.on(STREAM_LEAVED, ({ conversationId }) => {
      const { activeConversation } = this.props;
      if (conversationId !== activeConversation.data._id) return;
      message.info('Call ended!', 10);
      window.setTimeout(() => {
        Router.back();
      }, 5000);
    });
  }

  leaveSession() {
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    if (this.socket && activeConversation?.data?._id) {
      this.socket && this.socket.off(JOINED_THE_ROOM);
      this.socket && this.socket.off(STREAM_JOINED);
      this.socket && this.socket.off(STREAM_LEAVED);
      this.socket.emit(STREAM_EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
    }
    dispatchResetStreamMessage();
    this._intervalCallTime && clearInterval(this._intervalCallTime);
    this.setState({
      processing: false,
      roomJoined: false,
      callTime: 0,
      total: 0
    });
  }

  async acceptRequest() {
    const { id, accessPrivateRequest: handleAcceptRequest, getStreamConversationSuccess: dispatchGetStreamConversationSuccess } = this.props;
    if (!id) return;
    try {
      this.setState({ processing: true });
      const resp = await (await streamService.acceptPrivateChat(id)).data;
      if (id !== resp.conversation._id || !resp.isStreaming) {
        message.error('Private call session ended!');
        Router.back();
        return;
      }
      const socket = this.context;
      socket && socket.emit(STREAM_EVENT.JOIN_ROOM, {
        conversationId: resp.conversation._id
      });
      this.requestSession = resp;
      dispatchGetStreamConversationSuccess({
        data: resp.conversation
      });
      handleAcceptRequest(id);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
      Router.back();
    }
  }

  paymentSuccess({ conversation }) {
    const { conversation: requestConversation } = this.requestSession;
    if (!conversation || !conversation._id || conversation?.type !== 'stream_private' || requestConversation?._id !== conversation?._id) return;
    this._intervalCallTime = setInterval(() => {
      const { callTime } = this.state;
      this.setState({ callTime: callTime + 1 });
    }, 1000);
    this.setState({ processing: false, roomJoined: true });
  }

  leave() {
    this.publisherRef.current && this.publisherRef.current.stop();
    this.subscriberRef.current && this.subscriberRef.current.stop();
    Router.back();
  }

  async declineRequest(data) {
    const { activeConversation } = this.props;
    const { conversationId } = data;
    if (activeConversation.data && activeConversation.data._id !== conversationId) return;
    message.error(`${this.requestSession?.user?.name || this.requestSession?.user?.username || ''} canceled call request`);
    Router.back();
  }

  render() {
    if (!this.publisherRef) this.publisherRef = createRef();
    if (!this.subscriberRef) this.subscriberRef = createRef();
    const {
      processing, total, roomJoined, callTime, subscriberStreamId
    } = this.state;

    return (
      <>
        <Header>
          <title>{`Private call with ${this.requestSession?.user?.name || this.requestSession?.user?.username || ''}`}</title>
        </Header>
        <Event
          event={STREAM_EVENT.PRIVATE_CHAT_PAYMENT_SUCCESS}
          handler={this.paymentSuccess.bind(this)}
        />
        <Event
          event={STREAM_EVENT.PRIVATE_CHAT_DECLINE}
          handler={this.declineRequest.bind(this)}
        />
        <div className="container">
          <Row>
            <Col md={14} xs={24}>
              {!roomJoined
                ? (
                  <Button
                    type="primary"
                    onClick={this.acceptRequest.bind(this)}
                    loading={processing}
                    disabled={processing}
                    block
                  >
                    {`Waiting for ${this.requestSession?.user?.name || this.requestSession?.user?.username || ''} payment $${(this.requestSession?.price || 0).toFixed(2)}`}
                  </Button>
                )
                : (
                  <Button
                    type="primary"
                    onClick={this.leave.bind(this)}
                    block
                    disabled={processing}
                    loading={processing}
                  >
                    End Call
                  </Button>
                )}
              <p className="stream-duration">
                <ClockCircleOutlined />
                {' '}
                {videoDuration(callTime)}
              </p>
              <div className={!roomJoined ? 'hide private-streaming-container' : 'private-streaming-container'}>
                <PrivateHlsPublisher
                  {...this.props}
                  containerClassName="private-streaming-container"
                  ref={this.publisherRef}
                  configs={{
                    localVideoId: 'private-publisher'
                  }}
                />
                {subscriberStreamId && (
                <PrivateHlsSubscriber
                  {...this.props}
                  containerClassName="private-streaming-container"
                  streamId={subscriberStreamId}
                  ref={this.subscriberRef}
                  configs={{
                    isPlayMode: true
                  }}
                />
                )}
              </div>
            </Col>
            <Col xs={24} md={10}>
              <ChatBox
                {...this.props}
                totalParticipant={total}
                members={[]}
                hideMember
              />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

ModelPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  user: state.user.current,
  activeConversation: state.streamMessage.activeConversation,
  ...state.streaming
});

const mapDispatchs = {
  accessPrivateRequest,
  getStreamConversationSuccess,
  resetStreamMessage
};

export default connect(
  mapStateToProps,
  mapDispatchs
)(ModelPrivateChat);
