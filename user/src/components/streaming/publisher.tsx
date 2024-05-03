/* eslint-disable camelcase */
import React, { PureComponent } from 'react';
import withAntmedia from 'src/antmedia';
import { Button, message, Space } from 'antd';
import { getResponseError } from '@lib/utils';
import { streamService } from 'src/services';
import { StreamSettings } from 'src/interfaces';
import './index.less';

interface IProps {
  participantId?: string;
  className?: string;
  webRTCAdaptor: any;
  initWebRTCAdaptor: Function;
  leaveSession: Function;
  publish_started: boolean;
  initialized: boolean;
  settings: StreamSettings;
}

interface States {
  streamId: string;
  processing: boolean;
}

class Publisher extends PureComponent<IProps, States> {
  constructor(props) {
    super(props);
    this.state = {
      streamId: '',
      processing: false
    };
  }

  componentDidUpdate(prevProps: IProps) {
    const { publish_started } = this.props;
    const { processing } = this.state;
    if (processing && publish_started !== prevProps.publish_started) {
      this.handleProcessing(false);
    }
  }

  async handlePublishing(streamId: string) {
    const { webRTCAdaptor, leaveSession, settings } = this.props;
    try {
      const token = await streamService.getPublishToken({ streamId, settings });
      webRTCAdaptor.publish(streamId, token);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
      leaveSession();
    }
  }

  handleProcessing(processing: boolean) {
    this.setState({ processing });
  }

  handleOnOffStream() {
    const { publish_started, webRTCAdaptor } = this.props;
    const { streamId } = this.state;
    if (!streamId) {
      return;
    }

    this.handleProcessing(true);
    if (publish_started) {
      webRTCAdaptor.stop(streamId);
      return;
    }

    this.handlePublishing(streamId);
  }

  start() {
    const { initWebRTCAdaptor } = this.props;
    initWebRTCAdaptor();
  }

  stop() {
    window.location.reload();
  }

  publish(streamId: string) {
    const { initialized } = this.props;
    this.setState({ streamId });
    initialized && this.handlePublishing(streamId);
  }

  render() {
    const { initialized, publish_started } = this.props;
    const { processing, streamId } = this.state;
    const videoProps = {
      id: 'publisher',
      autoPlay: true,
      muted: true,
      controls: true,
      playsInline: true,
      width: '100%',
      poster: '/static/offline.jpg'
    };
    return (
      <div style={initialized ? { minHeight: 300 } : null}>
        <video {...videoProps} />
        {initialized && (
          <Space direction="vertical" style={{ width: '100%' }}>
            {streamId && (
            <Button type="primary" block disabled={processing} loading={processing} onClick={this.handleOnOffStream.bind(this)}>
              {publish_started ? 'Pause' : 'Resume'}
            </Button>
            )}
            <Button type="default" disabled={processing} onClick={this.stop.bind(this)} block>
              End Streaming Session
            </Button>
          </Space>
        )}
      </div>
    );
  }
}

export default withAntmedia(Publisher);
