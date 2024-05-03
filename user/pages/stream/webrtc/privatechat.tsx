import React, { PureComponent } from 'react';
import Header from 'next/head';
import {
  Row, Col, message, Button, Modal, Spin
} from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import Router, { Router as RouterEvent } from 'next/router';
import {
  IPerformer, IUIConfig, IUser, StreamSettings
} from 'src/interfaces';
import { paymentService, performerService, streamService } from 'src/services';
import { connect } from 'react-redux';
import {
  getStreamConversationSuccess,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import { SocketContext, Event } from 'src/socket';
import nextCookie from 'next-cookies';
import ChatBox from '@components/stream-chat/chat-box';
import { getResponseError, videoDuration } from '@lib/index';
import PrivatePublisher from 'src/components/streaming/webrtc/privatechat/publisher';
import PrivateSubscriber from 'src/components/streaming/webrtc/privatechat/subscriber';
import StreamPriceForm from '@components/streaming/set-price-session';
import { PurchaseStreamForm } from '@components/streaming/confirm-purchase';
import Layout from 'antd/lib/layout/layout';
import { PaymentIframeForm } from '@components/payment/form-iframe';
import '../../content-creator/live/index.less';

// eslint-disable-next-line no-shadow
enum EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged',
  PRIVATE_CHAT_DECLINE = 'private-chat-decline',
  PRIVATE_CHAT_ACCEPT = 'private-chat-accept',
  PRIVATE_CHAT_PAYMENT_SUCCESS = 'private-chat-payment-success'
}

const STREAM_JOINED = 'private-stream/streamJoined';
const STREAM_LEAVED = 'private-stream/streamLeaved';
const JOINED_THE_ROOM = 'JOINED_THE_ROOM';

interface IProps {
  ui: IUIConfig;
  performer: IPerformer;
  user: IPerformer;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  updateBalance: Function;
  settings: StreamSettings;
}

interface IStates {
  roomJoined: boolean;
  processing: boolean;
  total: number;
  members: IUser[];
  callTime: number;
  sessionPrice: number;
  openPriceModal: boolean;
  countTime: number;
  redirectUrl: string;
  openPaymentModal: boolean;
}

class UserPrivateChat extends PureComponent<IProps, IStates> {
  static layout = 'stream';

  static authenticate = true;

  private publisherRef;

  private subscriberRef;

  private streamId: string;

  private socket;

  private _intervalCallTime: NodeJS.Timeout;

  private _intervalCountdown: NodeJS.Timeout;

  private requestSession: any;

  static async getInitialProps({ ctx }) {
    try {
      const { query } = ctx;
      if (process.browser && query.performer) {
        return {
          performer: JSON.parse(query.performer)
        };
      }

      const { token } = nextCookie(ctx);
      const headers = { Authorization: token };
      const resp = await performerService.findOne(query.username, headers);
      const performer: IPerformer = resp.data;
      return {
        performer
      };
    } catch (e) {
      if (process.browser) {
        return Router.back();
      }

      ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/home' });
      ctx.res.end && ctx.res.end();
      return {};
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      openPriceModal: false,
      processing: false,
      roomJoined: false,
      openPaymentModal: false,
      total: 0,
      callTime: 0,
      members: [],
      sessionPrice: 0,
      countTime: 300,
      redirectUrl: ''
    };
  }

  componentDidMount() {
    const { performer } = this.props;
    if (!performer.isOnline) {
      message.error(`${performer?.name || performer?.username} is offline!`);
      Router.back();
      return;
    }
    this.setState({ sessionPrice: performer.privateChatPrice });
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.on('routeChangeStart', this.onbeforeunload.bind(this));
  }

  componentDidUpdate(prevProps: IProps, prevState: IStates) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id !== prevProps.activeConversation?.data?._id) {
      this.initSocketEvent();
    }
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  async handlePurchase(couponCode: string) {
    const { streamId } = this.requestSession;
    if (!streamId) return;
    try {
      await this.setState({ processing: true });
      const resp = await (await paymentService.purchaseStream({ streamId, couponCode, type: 'private_chat' })).data;
      message.info('Waiting for payment');
      // redirect to payment
      if (resp.redirectUrl) {
        this.setState({ redirectUrl: resp.redirectUrl });
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      this.setState({ processing: false });
    }
  }

  onbeforeunload = () => {
    this.leaveSession();
  };

  async onCancelRequest() {
    if (!window.confirm('Cancel call request?')) return;
    try {
      const { conversation } = this.requestSession;
      conversation && await streamService.declinePrivateChat(conversation._id);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      Router.back();
    }
  }

  handleCountdown = () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 300 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.countdown.bind(this), 1000);
  }

  leave() {
    this.publisherRef.current && this.publisherRef.current.stop();
    this.subscriberRef.current && this.subscriberRef.current.stop();
    Router.back();
  }

  initSocketEvent() {
    this.socket = this.context;
    this.socket.on(
      JOINED_THE_ROOM,
      ({ streamId, conversationId }) => {
        const { activeConversation } = this.props;
        if (conversationId !== activeConversation.data._id) return;
        this.streamId = streamId;
      }
    );
    this.socket.on(STREAM_JOINED, ({ streamId, conversationId }) => {
      const { activeConversation } = this.props;
      if (conversationId !== activeConversation.data._id) return;
      if (this.streamId !== streamId) {
        this.subscriberRef.current && this.subscriberRef.current.play(streamId);
      }
    });
    this.socket.on(STREAM_LEAVED, ({ conversationId }) => {
      const { activeConversation } = this.props;
      if (conversationId !== activeConversation.data._id) return;
      message.info('Call ended!', 10);
      setTimeout(() => {
        Router.back();
      }, 5 * 1000);
    });
  }

  async sendRequest(payload) {
    const { performer, getStreamConversationSuccess: dispatchGetStreamConversationSuccess } = this.props;
    if (payload.price < performer.privateChatPrice) {
      message.error(`${performer?.name || performer?.username} require minimum $${performer.privateChatPrice} to accept call!`);
      return;
    }
    try {
      this.setState({ processing: true });
      const resp = await (await streamService.requestPrivateChat(performer._id, { price: payload.price, userNote: payload.userNote || '' })).data;
      message.success(`Requested a Private call to ${performer?.name || performer?.username}!`);
      this.handleCountdown();
      this.requestSession = resp;
      const socket = this.context;
      socket.emit(EVENT.JOIN_ROOM, {
        conversationId: resp.conversation._id
      });
      dispatchGetStreamConversationSuccess({
        data: resp.conversation
      });
      this.setState({ sessionPrice: resp.price });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      this.setState({ processing: false, openPriceModal: false });
    }
  }

  leaveSession() {
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    const socket = this.context;
    dispatchResetStreamMessage();
    this.socket && this.socket.off(JOINED_THE_ROOM);
    this.socket && this.socket.off(STREAM_JOINED);
    this.socket && this.socket.off(STREAM_LEAVED);
    if (socket && activeConversation && activeConversation.data) {
      socket.emit(EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
    }
    this._intervalCallTime && clearInterval(this._intervalCallTime);
    this._intervalCountdown && clearInterval(this._intervalCountdown);

    this.setState({
      processing: false,
      roomJoined: false,
      callTime: 0,
      total: 0,
      members: []
    });
  }

  async acceptRequest(data) {
    const { performer } = this.props;
    const { conversation: { _id } } = data;
    message.success(`${performer?.name || performer?.username} accepted your call request!`);
    const { conversation } = this.requestSession;
    if (!conversation || _id !== conversation._id) return;
    this.setState({ openPaymentModal: true });
  }

  countdown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  async declineRequest(data) {
    const { activeConversation } = this.props;
    const { conversationId } = data;
    if (activeConversation.data && activeConversation.data._id !== conversationId) return;
    message.error('Your call request has been declined, please try a new one!');
    this._intervalCountdown && clearInterval(this._intervalCountdown);
    this.setState({ countTime: 300 });
  }

  paymentSuccess({ conversation }) {
    const { performer } = this.props;
    const { conversation: requestConversation } = this.requestSession;
    if (!conversation || !conversation._id || conversation?.type !== 'stream_private' || requestConversation?._id !== conversation?._id) return;
    message.success(`Payment success, calling ${performer?.name || performer?.username} right now`, 10);
    this.publisherRef.current && this.publisherRef.current.start(conversation._id);
    this.streamId && this.publisherRef.current && this.publisherRef.current.publish(this.streamId);
    this._intervalCountdown && clearInterval(this._intervalCountdown);
    this._intervalCallTime = setInterval(() => {
      const { callTime } = this.state;
      this.setState({ callTime: callTime + 1 });
    }, 1000);
    this.setState({ openPaymentModal: false, roomJoined: true, countTime: 300 });
  }

  render() {
    const {
      processing, total, members, roomJoined, callTime, openPriceModal,
      sessionPrice, countTime, openPaymentModal, redirectUrl
    } = this.state;
    const { ui, performer, user } = this.props;
    if (!this.publisherRef) {
      this.publisherRef = React.createRef();
    }
    if (!this.subscriberRef) {
      this.subscriberRef = React.createRef();
    }
    return (
      <Layout>
        <Header>
          <title>{`${ui?.siteName} | Private Call ${performer?.name || performer?.username}`}</title>
        </Header>
        <Event
          event={EVENT.PRIVATE_CHAT_DECLINE}
          handler={this.declineRequest.bind(this)}
        />
        <Event
          event={EVENT.PRIVATE_CHAT_ACCEPT}
          handler={this.acceptRequest.bind(this)}
        />
        <Event
          event={EVENT.PRIVATE_CHAT_PAYMENT_SUCCESS}
          handler={this.paymentSuccess.bind(this)}
        />
        <div className="container">
          <Row>
            <Col md={14} xs={24}>
              {!roomJoined ? (
                <Button
                  type="primary"
                  onClick={() => this.setState({ openPriceModal: true })}
                  loading={processing || countTime < 300}
                  block
                  disabled={processing || countTime < 300}
                >
                  {countTime < 300 ? `Re-send in ${videoDuration(countTime)}` : (
                    <a>
                      {`Request a Private Call to ${performer?.name || performer?.username} by $${sessionPrice.toFixed(2)}`}
                    </a>
                  )}
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={this.leave.bind(this)}
                  block
                  disabled={processing}
                >
                  End Call
                </Button>
              )}
              <p className="stream-duration">
                <ClockCircleOutlined />
                {' '}
                {videoDuration(callTime)}
              </p>
              {(!roomJoined && countTime < 300) && [
                <h4 key="text_1" className="text-center">{`Your request has been sent, please waiting for ${performer?.name || performer?.username} accept!`}</h4>,
                <div key="text_2" className="text-center"><Spin size="large" /></div>]}
              <div className={!roomJoined ? 'hide private-streaming-container' : 'private-streaming-container'}>
                <PrivatePublisher
                  containerClassName="private-streaming-container"
                  {...this.props}
                  ref={this.publisherRef}
                  configs={{
                    localVideoId: 'private-publisher'
                  }}
                />
                <PrivateSubscriber
                  {...this.props}
                  containerClassName="private-streaming-container"
                  ref={this.subscriberRef}
                  configs={{
                    isPlayMode: true
                  }}
                />
              </div>
            </Col>
            <Col xs={24} md={10}>
              <ChatBox
                {...this.props}
                totalParticipant={total}
                members={members}
                hideMember
              />
            </Col>
          </Row>
          <Modal
            key="update_stream"
            title="Send Private Call Request"
            visible={openPriceModal}
            footer={null}
            onCancel={() => sessionPrice && this.setState({ openPriceModal: false })}
          >
            <StreamPriceForm price={sessionPrice} streamType="private" submiting={processing} performer={performer} user={user} onFinish={this.sendRequest.bind(this)} />
          </Modal>
          <Modal
            key="payment-form"
            title="CCbill Payment"
            visible={openPaymentModal}
            width={redirectUrl ? 990 : 650}
            footer={null}
            onCancel={this.onCancelRequest.bind(this)}
          >
            {redirectUrl ? <PaymentIframeForm redirectUrl={redirectUrl} /> : <PurchaseStreamForm performer={performer} price={sessionPrice} onFinish={this.handlePurchase.bind(this)} submiting={processing} />}
          </Modal>
        </div>
      </Layout>
    );
  }
}

UserPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ui: state.ui,
  ...state.streaming,
  user: state.user.current,
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatchs = {
  getStreamConversationSuccess,
  resetStreamMessage
};
export default connect(
  mapStateToProps,
  mapDispatchs
)(UserPrivateChat);
