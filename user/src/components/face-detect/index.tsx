import { createRef, PureComponent } from 'react';
import * as faceapi from 'face-api.js';
import { message, Modal, Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import './index.less';

export default class FaceImage extends PureComponent<any> {
  videoRef: any;

  canvasResult: any;

  valid: boolean = false;

  width = 1280;

  height = 720;

  stream: any;

  timeout = null;

  state = {
    modalOpen: false,
    score: 0,
    faceDetected: 0
  }

  async handleOk() {
    await this._closeModal();
    const { onOk, fileName = 'face.png' } = this.props;
    if (onOk) {
      if (!this.valid) return onOk(false);

      const base64 = this.canvasResult?.toDataURL('image/png');
      let file = null;
      if (base64) {
        const blobBin = atob(base64.split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i += 1) {
          array.push(blobBin.charCodeAt(i));
        }
        file = new File(
          [new Blob([new Uint8Array(array)], { type: 'image/png' })],
          fileName,
          {
            type: 'image/png'
          }
        );
      }

      onOk({
        image: this.canvasResult?.toDataURL('image/png'),
        file
      });
    }

    return false;
  }

  async handleCancel() {
    await this._closeModal();
  }

  async detectImage() {
    try {
      const video = this.videoRef.current;
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      if (detections?.length) {
        if (detections.length > 1) {
          this.valid = false;
          await this.setState({
            score: 0,
            faceDetected: detections.length
          });
          this.timeout = setTimeout(() => this.detectImage(), 500);
          return;
        }

        const detection = detections[0];

        // create image data and hold it
        this.valid = true;
        if (!this.canvasResult) {
          this.canvasResult = document.createElement('canvas');
          this.canvasResult.width = this.width;
          this.canvasResult.height = this.height;
        }

        const ctx = this.canvasResult.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(video, 0, 0, this.width, this.height);
        await this.setState({
          score: detection.detection.score,
          faceDetected: 1
        });
      } else {
        this.valid = false;
        await this.setState({
          score: 0,
          faceDetected: 0
        });
      }

      this.timeout = setTimeout(() => this.detectImage(), 500);
    } catch (e) {
      // TODO - do something
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  async _closeModal() {
    await this.setState({
      modalOpen: false
    });
    if (this.timeout) clearTimeout(this.timeout);
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track && track.stop());
    }
  }

  async openCamera(e) {
    e.preventDefault();
    const MODEL_URL = '/static/weights';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    const videoConstraints = {
      // HD video, should have option for VGA 640x480
      video: { width: { min: 1280 }, height: { min: 720 } }
    };
    const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
    if (stream) {
      this.stream = stream;
      await this.setState({
        modalOpen: true
      });
      this.videoRef.current.srcObject = stream;
    } else {
      message.error('Fail to open camera, please recheck your camera device!');
    }
  }

  render() {
    const { modalOpen, score, faceDetected } = this.state;
    if (!this.videoRef) {
      this.videoRef = createRef();
    }
    return (
      <>
        <Button onClick={this.openCamera.bind(this)} className="camera-face">
          AI
          <VideoCameraOutlined />
        </Button>
        <Modal
          title="Capture face from camera"
          visible={modalOpen}
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <video
            onLoadedMetadata={this.detectImage.bind(this)}
            ref={this.videoRef}
            autoPlay
            muted
            playsInline
            width={this.width}
            style={{ maxWidth: '100%' }}
          />
          {!score ? null : (
            <p>
              Detected and matched
              {' '}
              {Math.round(score * 100)}
              %. Please click OK button to upload.
            </p>
          )}
          {faceDetected > 1 ? (
            <p>
              Detected
              {' '}
              {faceDetected}
              {' '}
              faces!
            </p>
          ) : null}
        </Modal>

      </>
    );
  }
}
