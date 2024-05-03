/* eslint-disable @typescript-eslint/no-unused-vars */
import { IOneTimeToken, StreamSettings } from 'src/interfaces';
import moment from 'moment';
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import { APIRequest } from './api-request';

class StreamService extends APIRequest {
  getSessionId(id: string, type: string) {
    return this.get(`/streaming/session/${id}/${type}`);
  }

  updateStreamPrice(payload) {
    return this.put('/streaming/set-price', payload);
  }

  updateStreamDuration(payload) {
    return this.put('/streaming/set-duration', payload);
  }

  goLive() {
    return this.post('/streaming/live');
  }

  joinPublicChat(performerId: string) {
    return this.post(`/streaming/join/${performerId}`);
  }

  requestPrivateChat(performerId: string, payload) {
    return this.post(`/streaming/private-chat/${performerId}`, payload);
  }

  acceptPrivateChat(id: string) {
    return this.get(`/streaming/private-chat/${id}`);
  }

  declinePrivateChat(id: string) {
    return this.post(`/streaming/private-chat/${id}/decline`);
  }

  startGroupChat() {
    return this.post('/streaming/group-chat');
  }

  joinGroupChat(id: string) {
    return this.get(`/streaming/group-chat/${id}`);
  }

  generateOneTimeToken(data: IOneTimeToken) {
    return this.post('/streaming/token', data);
  }

  async getPublishToken(options: {
    streamId: string,
    settings: StreamSettings
    }, expireDate = moment().add(1, 'd').toDate().getTime()): Promise<string> {
    try {
      const { settings, streamId } = options;
      const { secureOption } = settings;
      if (secureOption) {
        const resp = await this.generateOneTimeToken({
          id: streamId,
          type: 'publish',
          expireDate
        });
        return resp.data.tokenId;
      }

      return null;
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
      return null;
    }
  }

  async getSubscriberToken(options: {
    streamId: string,
    settings: StreamSettings
    }, expireDate = moment().add(1, 'd').toDate().getTime()): Promise<string> {
    try {
      const { settings, streamId } = options;
      const { secureOption } = settings;
      if (secureOption) {
        const resp = await this.generateOneTimeToken({
          id: streamId,
          type: 'play',
          expireDate
        });
        return resp.data.tokenId;
      }

      return null;
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
      return null;
    }
  }

  async getLiveStreamOrVodURL(options: {
    streamId: string,
    settings: StreamSettings,
    appName: string
    }, expireDate = moment().add(1, 'd').toDate().getTime(), _player = 'hls') {
    // http://[IP_Address]/<Application_Name>/streams/streamID.mp4?token=tokenId
    // http://[IP_Address]/<Application_Name>/streams/streamID.m3u8?token=tokenId
    // http://[IP_Address]/<Application_Name>/play.html?name=streamID&playOrder=hls&token=tokenId
    try {
      // const src = `https://${viewerURL}:5443/${appName}/streams/${streamId}.m3u8${oneTimeToken ? `?token=${oneTimeToken}` : ''}`;
      // eslint-disable-next-line no-shadow
      const { appName, settings, streamId } = options;
      const { secureOption, viewerURL } = settings;
      if (!viewerURL) {
        return '';
      }

      let oneTimeToken = '';
      if (secureOption) {
        const resp = await this.generateOneTimeToken({
          id: streamId,
          type: 'play',
          expireDate
        });
        oneTimeToken = resp.data.tokenId;
      }

      return `${window.location.protocol}//${viewerURL}/${appName}/streams/${streamId}.m3u8${oneTimeToken ? `?token=${oneTimeToken}` : ''}`;
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
      return '';
    }
  }
}

export const streamService = new StreamService();
