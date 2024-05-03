/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import * as React from 'react';
import classnames from 'classnames';
import withAntMedia from 'src/antmedia';
import { streamService } from 'src/services';
import { StreamSettings } from 'src/interfaces';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import { WebRTCAdaptorConfigs } from 'src/antmedia/interfaces/WebRTCAdaptorConfigs';
import './index.less';

interface Props {
  participantId?: string;
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  publish_started: boolean;
  initialized: boolean;
  classNames?: any;
  settings: StreamSettings;
  configs: WebRTCAdaptorConfigs;
}

interface States {
  streamId: string;
}

const DEFAULT_OFFLINE_IMAGE_URL = '/static/offline.jpg';

class Subscriber extends React.PureComponent<Props, States> {
  private streamId: string;

  private activeStreams = [];

  async handler(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    const { webRTCAdaptor, settings } = this.props;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      const token = await streamService.getSubscriberToken({ streamId: this.streamId, settings });
      webRTCAdaptor.play(this.streamId, token);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.NEW_STREAM_AVAILABLE) {
      const activeStream = this.activeStreams.find((id) => id === obj.streamId);
      if (window['player']) {
        window['player'].dispose();
        window['player'] = undefined;
      }
      if (!activeStream) {
        this.activeStreams.push(obj.streamId);
        this.createRemoteVideo(obj.stream);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PLAY_FINISHED) {
      this.activeStreams = this.activeStreams.filter((id) => id !== obj.streamId);
      this.removeRemoteVideo();
      if (!window['player']) {
        const video = document.createElement('video') as any;
        video.setAttribute('id', 'subscriber');
        video.setAttribute('class', 'video-js');
        video.autoplay = true;
        video.muted = true;
        video.controls = true;
        video.playsInline = true;
        document.querySelector('.video-container').append(video);
        window['player'] = window['videojs']('subscriber', {
          autoplay: true,
          liveui: true
        });
        window['player'].poster(DEFAULT_OFFLINE_IMAGE_URL);
        window['player'].on('ended', this.ended.bind(this));
      }
    }
  }

  ended() {
    if (window['player']) {
      window['player'].controls(false);
      window['player'].reset();
      window['player'].poster(DEFAULT_OFFLINE_IMAGE_URL);
    }
  }

  createRemoteVideo(stream: any) {
    const video = document.createElement('video') as any;
    video.setAttribute('id', 'subscriber');
    video.setAttribute('class', 'video-js');
    video.autoplay = true;
    video.muted = true;
    video.controls = true;
    video.playsInline = true;
    video.srcObject = stream;
    document.querySelector('.video-container').append(video);
  }

  removeRemoteVideo() {
    const video = document.getElementById('subscriber') as HTMLVideoElement;
    if (video) {
      video.srcObject = null;
      document.querySelector('.video-container').removeChild(video);
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

  async playHLS(streamId: string) {
    const { configs, settings } = this.props;
    const appName = configs.appName || settings.AntMediaAppname;
    const src = await streamService.getLiveStreamOrVodURL({
      appName,
      settings,
      streamId
    });
    if (!src) {
      return;
    }

    if (!window['player']) {
      window['player'] = window['videojs']('subscriber', {
        autoplay: true
      });
      window['player'].on('ended', this.ended.bind(this));
    }
    window['player'].addClass('vjs-waiting');

    setTimeout(() => {
      if (!window['player']) return;
      window['player'].src({
        type: 'application/x-mpegURL',
        src
      });
      window['player'].play();
      window['player'].controls(true);
    }, 10 * 1000);
  }

  render() {
    const { classNames } = this.props;
    const videoProps = {
      id: 'subscriber',
      controls: true,
      className: classnames('video-js', classNames),
      autoPlay: true,
      muted: true,
      playsInline: true,
      width: '100%'
    };
    return (
      <div className="video-container"><video {...videoProps} /></div>
    );
  }
}

export default withAntMedia(Subscriber);
