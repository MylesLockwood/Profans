/* eslint-disable dot-notation */
/* eslint-disable camelcase */
import {
  PureComponent, memo
} from 'react';
import classnames from 'classnames';
import fetch from 'isomorphic-unfetch';
import withAntMedia from 'src/antmedia';
import { streamService } from 'src/services';
import { StreamSettings } from 'src/interfaces';
import { WebRTCAdaptorConfigs } from 'src/antmedia/interfaces/WebRTCAdaptorConfigs';
import videojs from 'video.js';
import { generateUuid } from '@lib/string';
import '../../index.less';

interface Props {
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  publish_started: boolean;
  initialized: boolean;
  classNames?: any;
  settings: StreamSettings;
  configs: WebRTCAdaptorConfigs;
  streamId: string;
  leaveSession: Function;
  containerClassName?: string;
}

class AntVideoPlayer extends PureComponent<Props> {
  private player: videojs.Player;

  private getLiveStreamOrVodURLInterval;

  private id = `player-${generateUuid()}`;

  componentDidMount() {
    const { streamId } = this.props;
    if (streamId) {
      this.playHLS();
    }
  }

  componentWillUnmount() {
    this.stop();
    this.getLiveStreamOrVodURLInterval && clearInterval(this.getLiveStreamOrVodURLInterval);
    this.player && this.player.dispose();
  }

  createPlaybackideo() {
    const { classNames, streamId, containerClassName } = this.props;
    const container = document.getElementsByClassName(containerClassName)[0];
    const video = document.createElement('video') as any;
    video.setAttribute('id', this.id);
    video.setAttribute('class', classnames(classNames, 'subscriber video-js'));
    video.autoplay = true;
    video.muted = true;
    video.controls = false;
    video.playsInline = true;
    container.append(video);
    this.player = videojs(this.id, {
      autoplay: true,
      liveui: true
    });
    this.player.controls(false);
    this.player.on('ended', this.ended.bind(this));
    this.player.on('error', this.ended.bind(this));
    streamId && this.playHLS();
  }

  resetPlaybackVideo() {
    if (this.player?.src()) {
      this.player.dispose();
      this.player = undefined;
    }
  }

  async ended() {
    const { settings, streamId } = this.props;
    if (!streamId) {
      return;
    }

    const src = await streamService.getLiveStreamOrVodURL({
      streamId,
      settings,
      appName: settings.AntMediaAppname
    });
    if (src) {
      this.getLiveStreamOrVodURLInterval = setInterval(() => {
        fetch(src, { method: 'HEAD' }).then(() => {
          this.playHLS();
          this.getLiveStreamOrVodURLInterval
            && clearInterval(this.getLiveStreamOrVodURLInterval);
        });
      }, 5000);
    }
  }

  async playHLS() {
    if (!this.player) {
      this.createPlaybackideo();
    }
    const { settings, streamId } = this.props;
    const appName = settings.AntMediaAppname;
    this.getLiveStreamOrVodURLInterval && clearInterval(this.getLiveStreamOrVodURLInterval);
    const src = await streamService.getLiveStreamOrVodURL({
      appName,
      settings,
      streamId
    });
    if (!src) {
      return;
    }
    // this.player.addClass('vjs-waiting');

    setTimeout(() => {
      if (!this.player) return;
      this.player.src({
        type: 'application/x-mpegURL',
        src
      });
      this.player.play();
      this.player.controls(true);
    }, 1 * 1000);
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession && leaveSession();
  }

  render() {
    return <></>;
  }
}

export default memo(withAntMedia(AntVideoPlayer));
