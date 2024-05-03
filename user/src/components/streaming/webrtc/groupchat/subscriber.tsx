/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import * as React from 'react';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import classnames from 'classnames';
import withAntMedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';

interface Props {
  participantId?: string;
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  onClick?: (id) => void;
  publish_started: boolean;
  initialized: boolean;
  classNames?: any;
  containerClassName?: string;
  leaveSession: Function;
  settings: StreamSettings;
}

class Subscriber extends React.PureComponent<Props> {
  private streamIds: string[] = [];

  private videoIds = [];

  async handler(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    const { webRTCAdaptor, settings } = this.props;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      if (Array.isArray(this.streamIds)) {
        const tokens = await Promise.all(this.streamIds.map((streamId) => streamService.getSubscriberToken({ streamId, settings })));
        this.streamIds.map((id, i) => webRTCAdaptor.play(id, tokens[i]));
        return;
      }

      const token = await streamService.getSubscriberToken({ streamId: this.streamIds, settings });
      webRTCAdaptor.play(this.streamIds, token);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.NEW_STREAM_AVAILABLE) {
      const playedVideo = this.videoIds.find((id) => id === obj.streamId);
      if (!playedVideo) {
        this.videoIds.push(obj.streamId);
        this.createRemoteVideo(obj);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PLAY_FINISHED) {
      this.videoIds = this.videoIds.filter((id) => id !== obj.streamId);
      this.removeRemoteVideo(obj.streamId);
    }
  }

  createRemoteVideo({ stream, streamId }) {
    const { classNames, containerClassName, onClick: handleClick } = this.props;
    const video = document.createElement('video') as any;
    const container = document.getElementsByClassName(containerClassName)[0];
    video.setAttribute('id', `streamId-subscriber-${streamId}`);
    video.setAttribute('class', classnames('video-js', classNames));
    video.autoplay = true;
    video.muted = true;
    video.controls = true;
    video.playsInline = true;
    video.width = container.clientWidth / 4;
    video.srcObject = stream;
    video.addEventListener('click', handleClick);
    container.append(video);
  }

  removeRemoteVideo(streamId: string) {
    const { containerClassName } = this.props;
    const video = document.getElementById(`streamId-subscriber-${streamId}`) as HTMLVideoElement;
    if (video) {
      video.srcObject = null;
      const container = document.getElementsByClassName(containerClassName)[0];
      container.removeChild(video);
    }
  }

  async play(streamIds: string[]) {
    const {
      initWebRTCAdaptor, initialized, webRTCAdaptor, settings
    } = this.props;
    if (initialized) {
      if (Array.isArray(streamIds)) {
        const tokens = await Promise.all(streamIds.map((streamId) => streamService.getSubscriberToken({ streamId, settings })));
        streamIds.map((id, i) => webRTCAdaptor.play(id, tokens[i]));
      }
      return;
    }

    this.streamIds = [...this.streamIds, ...streamIds];
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
