/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import React, { PureComponent } from 'react';
import withAntmedia from 'src/antmedia';
import { Button, message } from 'antd';
import Router from 'next/router';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import { SocketContext } from 'src/socket';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import { WebRTCAdaptorConfigs } from 'src/antmedia/interfaces/WebRTCAdaptorConfigs';
import './private-streaming-container.less';

const STREAM_JOINED = 'private-stream/streamJoined';
const STREAM_LEAVED = 'private-stream/streamLeaved';
const JOINED_THE_ROOM = 'JOINED_THE_ROOM';

interface IProps {
  sessionId: string;
  participantId: string;
  controller?: boolean;
  onChange?: Function;
  publish_started: boolean;
  processing?: boolean;
  initialized?: boolean;
  initWebRTCAdaptor: Function;
  leaveSession: Function;
  onClick?: Function;
  btnText?: string;
  settings?: StreamSettings;
  webRTCAdaptor: any;
  configs: Partial<WebRTCAdaptorConfigs>;
}

interface IState {
  sessionId: string;
  conversationId: string;
  streamId: string;
  streamList: string[];
  loading: boolean;
  newAvailableStreams: any
}

class PrivateStreamingContainer extends PureComponent<IProps, IState> {
  private activeStreams = [];

  private socket: any;

  constructor(props) {
    super(props);
    this.state = {
      sessionId: '', // roomName
      streamId: '',
      streamList: [],
      conversationId: '',
      loading: false,
      newAvailableStreams: []
    };
  }

  // componentDidMount() {
  //   this.initSocketEvent();
  // }

  componentDidUpdate(prevProps: IProps, prevStates: IState) {
    const { processing, initialized } = this.props;
    const { conversationId, newAvailableStreams } = this.state;
    if (prevProps.processing !== processing) {
      this.handleLoading(processing);
    }

    if (conversationId && conversationId !== prevStates.conversationId) {
      this.initSocketEvent();
    }

    if (initialized && newAvailableStreams.length) {
      newAvailableStreams.forEach((streamId: string) => {
        this.play(streamId);
      });

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ newAvailableStreams: [] });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    Router.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  handleProcessing(loading: boolean) {
    this.setState({ loading });
  }

  handleLoading(v: boolean) {
    this.setState({ loading: v });
  }

  async onHandlePrivateStream(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    const {
      sessionId,
      conversationId,
      streamId
    } = this.state;
    const { settings, webRTCAdaptor } = this.props;

    if (info === 'initialized') {
      if (settings.optionForPrivate === 'hls') {
        const token = await streamService.getPublishToken({ streamId, settings });
        webRTCAdaptor.publish(streamId, token);
      }

      webRTCAdaptor.joinRoom(conversationId, streamId);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.NEW_STREAM_AVAILABLE) {
      const activeStream = this.activeStreams.find((id) => id === obj.streamId);
      if (!activeStream) {
        this.activeStreams.push(obj.streamId);
        this.createRemoteVideo(obj.stream);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.JOINED_THE_ROOM) {
      if (settings.optionForPrivate === 'webrtc') {
        const token = await streamService.getPublishToken({ streamId, settings });
        webRTCAdaptor.publish(streamId, token);
      }
    } else if (info === 'publish_started') {
      this.socket.emit('private-stream/join', {
        conversationId,
        streamId,
        sessionId
      });
      this.setState({ loading: false });
    } else if (info === 'publish_finished') {
      this.socket.emit('private-stream/leave', {
        conversationId,
        streamId,
        sessionId
      });
      this.setState({ loading: false });
    }
  }

  onbeforeunload() {
    this.leaveStream();
  }

  initSocketEvent() {
    const { initWebRTCAdaptor, settings } = this.props;
    this.socket = this.context;
    this.socket.on(
      JOINED_THE_ROOM,
      ({ streamId, streamList, conversationId: _id }) => {
        const { conversationId, newAvailableStreams } = this.state;
        if (_id !== conversationId) return;

        this.setState({ streamId, streamList });
        initWebRTCAdaptor(this.onHandlePrivateStream.bind(this));
        if (window['videojs'] && streamList.length) {
          settings.optionForPrivate === 'webrtc' ? this.setState({ newAvailableStreams: [...newAvailableStreams, streamList[0]] }) : this.subscribeHLS(streamList[0]);
        }
      }
    );
    this.socket.on(STREAM_JOINED, (data: { streamId: string }) => {
      const { streamId, newAvailableStreams } = this.state;
      if (window['videojs'] && streamId !== data.streamId) {
        settings.optionForPrivate === 'webrtc' ? this.setState({ newAvailableStreams: [...newAvailableStreams, data.streamId] }) : this.subscribeHLS(data.streamId);
      }
    });
    this.socket.on(STREAM_LEAVED, (data: { streamId: string }) => {
      const { streamList } = this.state;
      this.setState({
        streamList: streamList.filter((id) => id !== data.streamId)
      });
      window['mainPlayer'] && window['mainPlayer'].dispose();
      this.activeStreams = this.activeStreams.filter((id) => id !== data.streamId);
      this.removeRemoteVideo();
      message.error('Private call has ended.');
      window.setTimeout(() => {
        Router.push('/');
      }, 10 * 1000);
    });

    Router.events.on('routeChangeStart', this.onbeforeunload.bind(this));
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
  }

  start(sessionId: string, conversationId: string) {
    this.setState({ sessionId, conversationId });
  }

  leaveStream() {
    const { publish_started, webRTCAdaptor } = this.props;
    const { sessionId, conversationId, streamId } = this.state;
    this.socket.off(JOINED_THE_ROOM);
    this.socket.off(STREAM_JOINED);
    this.socket.off(STREAM_LEAVED);
    if (publish_started) {
      webRTCAdaptor && webRTCAdaptor.leaveFromRoom(conversationId);
      this.socket.emit('private-stream/leave', {
        conversationId,
        streamId,
        sessionId
      });
    }
  }

  ended() {
    window['mainPlayer'].dispose();
  }

  async subscribeHLS(streamId: string) {
    const { settings, configs } = this.props;
    const appName = configs.appName || settings.AntMediaAppname;

    const src = await streamService.getLiveStreamOrVodURL({
      appName,
      settings,
      streamId
    });
    if (!src) {
      return;
    }

    let video = document.querySelector('#private-subscriber');
    if (!video) {
      video = document.createElement('video');
      video.setAttribute('id', 'private-subscriber');
      video.setAttribute('class', 'video-js vjs-waiting vjs-16-9 vjs-4-3');
      video.setAttribute('autoplay', 'autoplay');
      video.setAttribute('data-setup', '{"fluid": true}');
      document.querySelector('.private-streaming-container').append(video);
    }

    if (!window['mainPlayer']) {
      window['mainPlayer'] = window['videojs']('private-subscriber', {
        liveui: true,
        controls: true
      });
      window['mainPlayer'].on('ended', this.ended.bind(this));
    }

    setTimeout(() => {
      if (!window['mainPlayer']) return;
      window['mainPlayer'].src({
        type: 'application/x-mpegURL',
        src
      });
      window['mainPlayer'].play();
    }, 10 * 1000);
  }

  createRemoteVideo(stream: any) {
    const video = document.createElement('video');
    video.setAttribute('id', 'private-subscriber');
    video.setAttribute('class', 'video-js');
    video.setAttribute('autoplay', 'autoplay');
    video.setAttribute('controls', 'controls');
    video.srcObject = stream;
    document.querySelector('.private-streaming-container').append(video);
    // video.oncanplay = (() => {
    //   window['player'] = window['videojs']('private-subscriber', {
    //     liveui: true,
    //     controls: true
    //   });
    // });
  }

  removeRemoteVideo() {
    const video = document.getElementById('private-subscriber') as HTMLVideoElement;
    if (video) {
      video.srcObject = null;
      // window['player'] && window['player'].dispose();
      document.querySelector('.private-streaming-container').removeChild(video);
    }
  }

  leave() {
    if (process.browser) {
      window.location.reload();
    }
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession();
  }

  async play(streamId: string) {
    const { settings, webRTCAdaptor } = this.props;
    const token = await streamService.getSubscriberToken({ streamId, settings });
    webRTCAdaptor.play(streamId, token);
  }

  render() {
    const { onClick, btnText, initialized } = this.props;
    const { loading } = this.state;
    return (
      <div className="private-streaming-container">
        <video id="private-publisher" autoPlay muted playsInline />
        {!initialized ? (
          <Button
            type="primary"
            onClick={() => onClick()}
            loading={loading}
            block
          >
            {btnText || 'Start Streaming'}
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={this.leave.bind(this)}
            block
            disabled={loading}
          >
            Stop Streaming
          </Button>
        )}
        {/* <video id="private-subscriber" playsInline autoPlay controls /> */}
      </div>
    );
  }
}

PrivateStreamingContainer.contextType = SocketContext;
export default withAntmedia(PrivateStreamingContainer);
