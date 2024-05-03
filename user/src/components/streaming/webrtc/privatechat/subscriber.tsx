/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import * as React from 'react';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import classnames from 'classnames';
import withAntMedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import './index.less';

interface Props {
  participantId?: string;
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  publish_started: boolean;
  initialized: boolean;
  classNames?: any;
  leaveSession: Function;
  settings: StreamSettings;
}

class Subscriber extends React.PureComponent<Props> {
  private streamId: string;

  private activeStreams = [];

  async handler(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    const { webRTCAdaptor, settings } = this.props;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      const token = await streamService.getSubscriberToken({ streamId: this.streamId, settings });
      webRTCAdaptor.play(this.streamId, token);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.NEW_STREAM_AVAILABLE) {
      const activeStream = this.activeStreams.find((id) => id === obj.streamId);
      if (!activeStream) {
        this.activeStreams.push(obj.streamId);
        this.createRemoteVideo(obj.stream);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PLAY_FINISHED) {
      this.activeStreams = this.activeStreams.filter((id) => id !== obj.streamId);
      this.removeRemoteVideo();
    }
  }

  createRemoteVideo(stream: any) {
    const { classNames } = this.props;
    const video = document.createElement('video') as any;
    video.setAttribute('id', 'private-subscriber');
    video.setAttribute('class', classnames('video-js', classNames));
    video.autoplay = true;
    video.muted = true;
    video.controls = true;
    video.playsInline = true;
    video.srcObject = stream;
    document.querySelector('.private-streaming-container').append(video);
  }

  removeRemoteVideo() {
    const video = document.getElementById('private-subscriber') as HTMLVideoElement;
    if (video) {
      video.srcObject = null;
      document.querySelector('.private-streaming-container').removeChild(video);
    }
  }

  async play(streamId: string) {
    const {
      initWebRTCAdaptor, initialized, webRTCAdaptor, settings
    } = this.props;
    if (initialized) {
      const token = await streamService.getSubscriberToken({ streamId, settings });
      webRTCAdaptor.play(streamId, token);
      return;
    }

    this.streamId = streamId;
    initWebRTCAdaptor(this.handler.bind(this));
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession();
  }

  render() {
    return (
      <></>
    );
  }
}

export default withAntMedia(Subscriber);
