/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import Router from 'next/router';
import React, { PureComponent } from 'react';
import withAntmedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import { SocketContext } from 'src/socket';
import './index.less';

const EVENTS = {
  JOIN_STREAM: 'private-stream/join',
  LEAVE_STREAM: 'private-stream/leave'
};

interface IProps {
  participantId?: string;
  className?: string;
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  publish_started: boolean;
  initialized: boolean;
  leaveSession: Function;
  settings: StreamSettings;
}

interface States {
  conversationId: string;
  streamId?: string;
}

class Publisher extends PureComponent<IProps, States> {
  private socket;

  constructor(props) {
    super(props);
    this.state = {
      conversationId: '',
      streamId: ''
    };
  }

  componentDidMount() {
    this.socket = this.context;
    Router.events.on('routeChangeStart', this.onbeforeunload);
    window.addEventListener('beforeunload', this.onbeforeunload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  async handler(info) {
    const { webRTCAdaptor, settings } = this.props;
    const { conversationId, streamId } = this.state;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      webRTCAdaptor.joinRoom(conversationId, streamId);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.JOINED_THE_ROOM) {
      const token = await streamService.getPublishToken({ streamId, settings });
      webRTCAdaptor.publish(streamId, token);
    } else if (info === 'publish_started') {
      this.socket.emit(EVENTS.JOIN_STREAM, {
        conversationId,
        streamId
      });
    } else if (info === 'publish_finished') {
      this.socket.emit(EVENTS.LEAVE_STREAM, {
        conversationId,
        streamId
      });
    }
  }

  onbeforeunload = () => {
    const { publish_started, webRTCAdaptor } = this.props;
    const { conversationId, streamId } = this.state;
    if (publish_started) {
      webRTCAdaptor && webRTCAdaptor.leaveFromRoom(conversationId);
      this.socket.emit(EVENTS.LEAVE_STREAM, {
        conversationId,
        streamId
      });
    }
  };

  start(conversationId: string) {
    this.setState({ conversationId });
  }

  async publish(streamId: string) {
    const { initWebRTCAdaptor } = this.props;
    await this.setState({ streamId });
    initWebRTCAdaptor(this.handler.bind(this));
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession();
  }

  render() {
    const { publish_started } = this.props;

    return (
      <video
        id="private-publisher"
        hidden={!publish_started}
        autoPlay
        playsInline
        muted
      />
    );
  }
}

Publisher.contextType = SocketContext;
export default withAntmedia(Publisher);
