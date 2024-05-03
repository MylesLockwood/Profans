/* eslint-disable dot-notation */
import React, { PureComponent } from 'react';
import Head from 'next/head';
import {
  Row, Col, Button, message, Modal, Alert
} from 'antd';
import { EditOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import {
  IUIConfig, IUser, IPerformer, StreamSettings
} from 'src/interfaces';
import { messageService, streamService } from 'src/services';
import LivePublisher from '@components/streaming/publisher';
import StreamPriceForm from '@components/streaming/set-price-session';
import { SocketContext, Event } from 'src/socket';
import {
  getStreamConversation,
  resetStreamMessage,
  resetAllStreamMessage
} from '@redux/stream-chat/actions';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import ChatBox from '@components/stream-chat/chat-box';
import Router, { Router as RouterEvent } from 'next/router';
import { getResponseError, videoDuration } from '@lib/index';
import './index.less';

// eslint-disable-next-line no-shadow
enum EVENT_NAME {
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed'
}

interface IProps {
  ui: IUIConfig;
  settings: StreamSettings;
  resetStreamMessage: Function;
  resetAllStreamMessage: Function;
  getStreamConversation: Function;
  activeConversation: any;
  user: IPerformer;
  loggedIn: boolean;
}

interface IStates {
  loading: boolean;
  initialized: boolean;
  total?: number;
  members?: IUser[];
  openPriceModal: boolean;
  submiting: boolean;
  sessionPrice: number;
  conversationDescription: string;
  callTime: number;
}

class PerformerLivePage extends PureComponent<IProps, IStates> {
  static layout = 'stream';

  static authenticate = true;

  static onlyPerformer = true;

  private publisherRef: any;

  private sessionId: string;

  private interval: NodeJS.Timeout;

  private setTimeInterval: NodeJS.Timeout;

  state = {
    loading: false,
    initialized: false,
    total: 0,
    members: [],
    openPriceModal: false,
    submiting: false,
    sessionPrice: 0,
    conversationDescription: '',
    callTime: 0
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your ID documents are not verified yet! You could not post any content right now. Please upload your ID documents to get approval then start making money.');
      Router.push('/content-creator/account');
      return;
    }

    this.joinPublicRoom();
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.on('routeChangeStart', this.onbeforeunload.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    RouterEvent.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  handler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      this.setState({ total, members });
    }
  }

  onbeforeunload = () => {
    this.interval && clearInterval(this.interval);
    this.setTimeInterval && clearInterval(this.setTimeInterval);
    this.leavePublicRoom();
  }

  async start() {
    this.setState({ loading: true });
    try {
      const resp = await streamService.goLive();
      const id = resp.data.sessionId;
      this.sessionId = id;
      this.publisherRef && this.publisherRef.start(id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error_broadcast', await e);
    } finally {
      this.setState({ loading: false });
    }
  }

  callback(info: WEBRTC_ADAPTOR_INFORMATIONS) {
    const { activeConversation } = this.props;
    if (activeConversation && activeConversation.data && this.sessionId) {
      const socket = this.context;
      if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
        this.setState({ initialized: true });
        this.publisherRef && this.publisherRef.publish(this.sessionId);
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED) {
        const conversation = { ...activeConversation.data };
        socket.emit('public-stream/live', { conversationId: conversation._id });
        this.interval = setInterval(() => {
          const { callTime } = this.state;
          this.setState({ callTime: callTime + 1 });
        }, 1000);
        this.setTimeInterval = setInterval(this.updateStreamDuration.bind(this), 10000);
        this.setState({ loading: false });
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_FINISHED) {
        this.interval && clearInterval(this.interval);
        this.setState({ loading: false });
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.CLOSED) {
        this.interval && clearInterval(this.interval);
        this.setState({ loading: false, initialized: false });
      }
    }
  }

  async joinPublicRoom() {
    const { getStreamConversation: dispatchGetStreamConversation } = this.props;
    const socket = this.context;
    try {
      this.setState({ loading: true });
      const resp = await streamService.goLive();
      const { conversation, sessionId, price } = resp.data;
      this.sessionId = sessionId;
      this.setState({
        sessionPrice: price || 0,
        conversationDescription: conversation.name,
        openPriceModal: price < 1
      });
      if (conversation && conversation._id) {
        dispatchGetStreamConversation({
          conversation
        });
        socket && socket.emit('public-stream/join', {
          conversationId: conversation._id
        });
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ loading: false });
    }
  }

  leavePublicRoom() {
    const { activeConversation, resetStreamMessage: reset } = this.props;
    const socket = this.context;
    const conversation = { ...activeConversation.data };
    if (socket && conversation && conversation._id) {
      socket.emit('public-stream/leave', { conversationId: conversation._id });
      reset();
    }
  }

  async updateStreamInfo(payload) {
    if (!payload.price) return;
    const { activeConversation } = this.props;
    const { conversationDescription, sessionPrice } = this.state;
    try {
      await this.setState({ submiting: true });
      if (payload.name && payload.name !== conversationDescription) {
        const resp = await messageService.updateConversationName(activeConversation.data._id, { name: payload.name });
        resp && this.setState({ conversationDescription: resp.data.name });
      }
      if (payload.price > 1 && payload.price !== sessionPrice) {
        const resp = await streamService.updateStreamPrice({ streamId: this.sessionId, price: payload.price });
        resp && this.setState({ sessionPrice: resp.data.price });
      }
    } catch (e) {
      message.error(getResponseError(e) || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openPriceModal: false });
    }
  }

  async updateStreamDuration() {
    if (!this.sessionId) {
      this.setTimeInterval && clearInterval(this.setTimeInterval);
      return;
    }
    const { callTime } = this.state;
    try {
      await streamService.updateStreamDuration({ streamId: this.sessionId, duration: callTime });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(await e);
    }
  }

  render() {
    const { user, ui } = this.props;
    const {
      loading, initialized, members, total, openPriceModal, submiting, sessionPrice,
      conversationDescription, callTime
    } = this.state;
    return (
      <>
        <Head>
          <title>
            {`${ui?.siteName} | Live Stream`}
          </title>
        </Head>
        <Event
          event={EVENT_NAME.ROOM_INFORMATIOM_CHANGED}
          handler={this.handler.bind(this)}
        />
        <Row>
          <Col xs={24} sm={24} md={14}>
            <Alert className="text-center" type="info" message={conversationDescription || `${user.name} Broadcast`} />
            <LivePublisher
              {...this.props}
              participantId={user._id}
              // eslint-disable-next-line no-return-assign
              ref={(ref) => (this.publisherRef = ref)}
              callback={this.callback.bind(this)}
              configs={{
                debug: true,
                bandwidth: 900,
                localVideoId: 'publisher'
              }}
            />
            <p className="stream-duration">
              <ClockCircleOutlined />
              {' '}
              {videoDuration(callTime)}
            </p>
            <div className="stream-description">
              {!initialized && (
              <Button
                key="start-btn"
                className="primary"
                onClick={this.start.bind(this)}
                loading={loading}
                disabled={loading || !this.sessionId}
                block
              >
                Start Broadcasting
              </Button>
              )}
              <Button
                key="price-btn"
                block
                className="secondary"
                disabled={loading || !this.sessionId}
                onClick={() => this.setState({ openPriceModal: true })}
              >
                Session Price
                $
                {sessionPrice}
                {' '}
                <EditOutlined />
              </Button>
            </div>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <ChatBox
              {...this.props}
              members={members}
              totalParticipant={total}
              hideMember={false}
            />
          </Col>
          <Modal
            key="update_stream"
            title="Update stream information"
            visible={openPriceModal}
            footer={null}
            onCancel={() => sessionPrice && this.setState({ openPriceModal: false })}
          >
            <StreamPriceForm price={sessionPrice} conversationDescription={conversationDescription} streamType="public" submiting={loading || submiting} performer={user} user={user} onFinish={this.updateStreamInfo.bind(this)} />
          </Modal>
        </Row>
      </>
    );
  }
}

PerformerLivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ui: state.ui,
  ...state.streaming,
  user: state.user.current,
  activeConversation: state.streamMessage.activeConversation,
  loggedIn: state.auth.loggedIn
});
const mapDispatchs = {
  getStreamConversation,
  resetStreamMessage,
  resetAllStreamMessage
};
export default connect(mapStateToProps, mapDispatchs)(PerformerLivePage);
