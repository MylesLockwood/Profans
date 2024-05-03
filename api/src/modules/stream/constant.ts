/* eslint-disable no-shadow */
export const PUBLIC_CHAT = 'public';
export const PRIVATE_CHAT = 'private';
export const GROUP_CHAT = 'group';
export const OFFLINE = 'offline';
export const MEMBER_LIVE_STREAM_CHANNEL = 'MEMBER_LIVE_STREAM_CHANNEL';
export const MODEL_LIVE_STREAM_CHANNEL = 'MODEL_LIVE_STREAM_CHANNEL';

export enum LIVE_STREAM_EVENT_NAME {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

export enum BroadcastStatus {
  FINISHED = 'finished',
  BROADCASTING = 'broadcasting',
  CREATED = 'created'
}

export enum BroadcastType {
  LiveStream = 'liveStream',
  IpCamera = 'ipCamera',
  StreamSource = 'streamSource',
  Vod = 'Vod'
}

export const defaultStreamValue = {
  publish: true,
  publicStream: true,
  plannedStartDate: 0,
  plannedEndDate: 0,
  duration: 0,
  mp4Enabled: 0,
  webMEnabled: 0,
  expireDurationMS: 0,
  speed: 0,
  pendingPacketSize: 0,
  hlsViewerCount: 0,
  webRTCViewerCount: 0,
  rtmpViewerCount: 0,
  startTime: 0,
  receivedBytes: 0,
  // bitrate: 0,
  absoluteStartTimeMs: 0,
  webRTCViewerLimit: -1,
  hlsViewerLimit: -1
};

export interface TokenResponse {
  tokenId: string,
  streamId: string,
  expireDate: number,
  type: string,
  roomId: string
}
