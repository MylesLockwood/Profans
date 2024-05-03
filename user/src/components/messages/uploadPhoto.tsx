/* eslint-disable react/destructuring-assignment */
import { Upload, message } from 'antd';
import { LoadingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { PureComponent } from 'react';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Image is too large please provide an image 5MB or below');
  }
  return isLt5M;
}

interface IState {
  uploading: boolean;
}

interface IProps {
  uploadUrl: string;
  headers: any;
  onUploaded: Function;
  options: any;
  messageData: any;
  disabled: boolean;
}

export class ImageMessageUpload extends PureComponent<IProps, IState> {
  state = {
    uploading: false
  };

  handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.setState({
          uploading: false
        });
        this.props.onUploaded
          && this.props.onUploaded({
            response: info.file.response,
            base64: imageUrl
          });
      });
    }
  };

  render() {
    const {
      headers, uploadUrl, messageData, options = {}, disabled
    } = this.props;
    const { uploading } = this.state;
    const uploadButton = (
      <div>
        {uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
      </div>
    );
    return (
      <Upload
        disabled={disabled || uploading}
        accept={'image/*'}
        name={options.fieldName || 'file'}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
        headers={headers}
        data={messageData}
      >
        {uploadButton}
      </Upload>
    );
  }
}
