/* eslint-disable dot-notation */
import { PureComponent, createRef } from 'react';
import Head from 'next/head';
import {
  Row, Col, message, Button, Alert, Modal
} from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { IResponse } from 'src/services/api-request';
import {
  IPerformer,
  IUser,
  StreamSettings,
  HLS,
  WEBRTC,
  IUIConfig
} from 'src/interfaces';
import { connect } from 'react-redux';
import {
  streamService, performerService, messageService, paymentService
} from 'src/services';
import { SocketContext, Event } from 'src/socket';
import nextCookie from 'next-cookies';
import Router from 'next/router';
import ChatBox from '@components/stream-chat/chat-box';
import LiveSubscriber from 'src/components/streaming/subscriber';
import {
  loadStreamMessages,
  getStreamConversationSuccess,
  resetStreamMessage,
  resetAllStreamMessage
} from '@redux/stream-chat/actions';
import { getResponseError, videoDuration } from '@lib/index';
import { PurchaseStreamForm } from '@components/streaming/confirm-purchase';
import '../content-creator/live/index.less';

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOIN_BROADCASTER = 'join-broadcaster',
  MODEL_LEFT = 'model-left',
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed',
  CHANGE_STREAM_INFO = 'change-stream-info'
}

const DEFAULT_OFFLINE_IMAGE_URL = '/static/offline.jpg';
const DEFAULT_PRIVATE_IMAGE_URL = '/static/private.png';
const DEFAULT_IMAGE_URL = '/static/offline.jpg';

interface IProps {
  resetStreamMessage: Function;
  resetAllStreamMessage: Function;
  getStreamConversationSuccess: Function;
  loadStreamMessages: Function;
  activeConversation: any;
  ui: IUIConfig;
  user: IUser;
  loggedIn: boolean;
  performer: IPerformer;
  success: boolean;
  searching: boolean;
  settings: StreamSettings;
}

class LivePage extends PureComponent<IProps> {
  static authenticate = true;

  private subscrbierRef: any;

  private socket;

  private interval: NodeJS.Timeout;

  private streamDurationInterval: NodeJS.Timeout;

  private sessionId;

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
      const resp: IResponse<IPerformer> = await performerService.findOne(
        query.username,
        headers
      );
      return {
        performer: resp.data
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

  state = {
    poster: '',
    total: 0,
    members: [],
    isBought: false,
    conversationDescription: '',
    openPurchaseModal: false,
    submiting: false,
    live: false,
    streamingStatus: 'public',
    sessionPrice: 0,
    sessionDuration: 0
  };

  componentDidMount() {
    const { performer } = this.props;
    if (!performer) {
      Router.back();
      return;
    }
    this.subscrbierRef = createRef();
    this.socket = this.context;
    Router.events.on('routeChangeStart', this.onbeforeunload.bind(this));
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
    this.interval = setInterval(this.updatePerformerInfo.bind(this), 60 * 1000);
    this.initProfilePage();
    this.setStreamStatus(performer.live, performer.streamingStatus);
    this.subscribe.bind(this, { performerId: performer._id });
  }

  componentDidUpdate(_, prevState) {
    const { poster, isBought } = this.state;
    if (!prevState.isBought && isBought) {
      if (window['player']) {
        window['player'].dispose();
      }
      window['player'] = window['videojs']('subscriber', {
        autoplay: true,
        liveui: true
      });
      window['player'].on('ended', this.ended.bind(this));
    }
    if (poster !== prevState.poster) {
      window['player'] && window['player'].poster(poster);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    Router.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  handleDuration() {
    const { sessionDuration } = this.state;
    this.setState({ sessionDuration: sessionDuration + 1 });
  }

  handleStreamInfo(data) {
    const { conversation, stream } = data;
    conversation && this.setState({ conversationDescription: conversation.name });
    stream && this.setState({ sessionPrice: stream.price });
  }

  onbeforeunload = () => {
    this.interval && clearInterval(this.interval);
    this.streamDurationInterval && clearInterval(this.streamDurationInterval);
    this.leavePublicRoom();
  };

  onChange({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (
      activeConversation?.data?._id
      && activeConversation.data._id === conversationId
    ) {
      this.setState({ total, members });
    }
  }

  setPoster(status: string) {
    switch (status) {
      case 'private':
        this.setState({ poster: DEFAULT_PRIVATE_IMAGE_URL });
        break;
      case 'offline':
        this.setState({ poster: DEFAULT_OFFLINE_IMAGE_URL });
        break;
      case 'public':
        this.setState({ poster: DEFAULT_IMAGE_URL });
        break;
      default:
        this.setState({ poster: DEFAULT_OFFLINE_IMAGE_URL });
        break;
    }
  }

  setStreamStatus(live: boolean, streamingStatus: string) {
    this.setState({ live, streamingStatus });
  }

  updatePerformerInfo = async () => {
    try {
      const { performer } = this.props;
      if (!performer) {
        return;
      }
      const resp = await performerService.findOne(performer.username);
      const { streamingStatus, live } = resp.data;
      this.setPoster(streamingStatus);
      this.setStreamStatus(live, streamingStatus);
    } catch (e) {
      const error = await Promise.resolve(e);
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  async purchaseStream(couponCode: string) {
    try {
      await this.setState({ submiting: true });
      const resp = await (await paymentService.purchaseStream({ streamId: this.sessionId, couponCode, type: 'public_chat' })).data;
      if (resp && resp.success) {
        message.info('Payment success', 10);
        setTimeout(() => { window.location.reload(); }, 3000);
        window.location.reload();
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async subscribe({ performerId }) {
    try {
      const {
        settings: { optionForBroadcast }
      } = this.props;
      const resp = await streamService.joinPublicChat(performerId);
      const {
        sessionId, isBought, price, isStreaming, streamingTime
      } = resp.data;
      this.sessionId = sessionId;
      await this.setState({ sessionPrice: price || 0 });
      if (isStreaming) {
        await this.setStreamStatus(true, 'public');
        await this.setState({ sessionDuration: streamingTime || 0 });
        this.streamDurationInterval = setInterval(this.handleDuration.bind(this), 1000);
      }
      isBought && await this.setState({ isBought });
      if (isBought) {
        if (optionForBroadcast === HLS) {
          this.subscrbierRef.current?.playHLS(sessionId);
        }
        if (optionForBroadcast === WEBRTC) {
          this.subscrbierRef.current?.play(sessionId);
        }
      }
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
    }
  }

  initProfilePage() {
    const {
      performer: { streamingStatus }
    } = this.props;
    this.setPoster(streamingStatus);
    this.joinPeformerPublicRoom();
    window['player'] && window['player'].controls(false);
  }

  ended() {
    window['player'].controls(false);
    window['player'].reset();
    window['player'].poster(DEFAULT_OFFLINE_IMAGE_URL);
  }

  async joinPeformerPublicRoom() {
    const {
      performer,
      loadStreamMessages: dispatchLoadStreamMessages,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess
    } = this.props;
    const socket = this.context;
    try {
      const resp = await messageService.findPublicConversationPerformer(
        performer._id
      );
      const conversation = resp.data;
      if (conversation && conversation._id) {
        this.handleStreamInfo({ conversation });
        dispatchGetStreamConversationSuccess({ data: conversation });
        dispatchLoadStreamMessages({
          conversationId: conversation._id,
          limit: 25,
          offset: 0,
          type: conversation.type
        });
        socket && socket.emit('public-stream/join', { conversationId: conversation._id });
      } else {
        throw new Promise((resolve) => resolve('No available broadcast. Try again later'));
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  }

  leavePublicRoom() {
    const { poster } = this.state;
    if (window['player']) {
      window['player'].reset();
      window['player'].poster(poster);
    }

    const socket = this.context;
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    dispatchResetStreamMessage();
    if (socket && activeConversation?.data?._id) {
      socket.emit('public-stream/leave', {
        conversationId: activeConversation?.data?._id
      });
    }
  }

  modelLeftHandler() {
    this.setState({ sessionDuration: 0 });
    this.streamDurationInterval && clearInterval(this.streamDurationInterval);
    message.info('Content creator left chat room!');
  }

  render() {
    const {
      performer, user, ui, settings, resetAllStreamMessage: dispatchResetAllStreamMessage
    } = this.props;
    const {
      members, total, isBought, conversationDescription, poster, openPurchaseModal, submiting,
      live, streamingStatus, sessionPrice, sessionDuration
    } = this.state;

    return (
      <>
        <Head>
          <title>{`${ui.siteName || ''} | ${performer?.name || performer?.username} Broadcast`}</title>
        </Head>
        <Event
          event={STREAM_EVENT.JOIN_BROADCASTER}
          handler={this.subscribe.bind(this)}
        />
        <Event
          event={STREAM_EVENT.CHANGE_STREAM_INFO}
          handler={this.handleStreamInfo.bind(this)}
        />
        <Event
          event={STREAM_EVENT.MODEL_LEFT}
          handler={this.modelLeftHandler.bind(this)}
        />
        <Event
          event={STREAM_EVENT.ROOM_INFORMATIOM_CHANGED}
          handler={this.onChange.bind(this)}
        />
        <div className="">
          <Row className="streaming-container">
            <Col md={14} xs={24}>
              {conversationDescription && <Alert style={{ margin: '0 0 10px', textAlign: 'center' }} type="info" message={conversationDescription} />}
              {isBought && this.sessionId && (
              <LiveSubscriber
                {...this.props}
                participantId={user.name}
                ref={this.subscrbierRef}
                configs={{
                  isPlayMode: true
                }}
              />
              )}
              {!isBought && (
                <img alt="img" src={poster} width="100%" />
              )}
              <p className="stream-duration">
                <ClockCircleOutlined />
                {' '}
                {videoDuration(sessionDuration)}
              </p>
              <div style={{ margin: 10, display: 'flex' }}>
                {!isBought && live && streamingStatus === 'public' && sessionPrice > 0 && (
                  <Button block className="primary" onClick={() => this.setState({ openPurchaseModal: true })}>
                    {`Join this Session by $${sessionPrice}`}
                  </Button>
                )}
                <Button
                  block
                  className="secondary"
                  disabled={!performer.isOnline}
                  onClick={() => performer.isOnline && Router.push(
                    {
                      pathname: `/stream/${settings.optionForPrivate === 'webrtc'
                        ? 'webrtc/'
                        : ''
                      }privatechat`,
                      query: { performer: JSON.stringify(performer) }
                    },
                    `/stream/${settings.optionForPrivate === 'webrtc'
                      ? 'webrtc/'
                      : ''
                    }privatechat/${performer.username}`
                  )}
                >
                  Go to Private Call
                </Button>
              </div>
            </Col>
            <Col md={10} xs={24}>
              <ChatBox
                {...this.props}
                members={members}
                totalParticipant={total}
                resetAllStreamMessage={dispatchResetAllStreamMessage}
                hideMember={false}
              />
            </Col>
          </Row>
          <Modal
            key="purchase_post"
            title={`Join ${performer.name || performer.username} Broadcast`}
            visible={openPurchaseModal}
            confirmLoading={submiting}
            footer={null}
            onCancel={() => this.setState({ openPurchaseModal: false })}
          >
            <PurchaseStreamForm price={sessionPrice} performer={performer} submiting={submiting} onFinish={this.purchaseStream.bind(this)} />
          </Modal>
        </div>
      </>
    );
  }
}

LivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ui: state.ui,
  ...state.streaming,
  ...state.performer.performerDetails,
  user: state.user.current,
  loggedIn: state.auth.loggedIn,
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatch = {
  loadStreamMessages,
  getStreamConversationSuccess,
  resetStreamMessage,
  resetAllStreamMessage
};
export default connect(mapStateToProps, mapDispatch)(LivePage);
