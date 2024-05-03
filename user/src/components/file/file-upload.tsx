import { Upload, message } from 'antd';
import { LoadingOutlined, FileAddOutlined, FileDoneOutlined } from '@ant-design/icons';
import { PureComponent } from 'react';

function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < 100;
  if (!isLt2M) {
    message.error('File is too large please provide an file 100MB or below');
  }
  return isLt2M;
}

interface IState {
  loading: boolean;
  fileUrl: string;
}

interface IProps {
  accept?: string;
  fieldName?: string;
  fileUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileReaded?: Function;
}

export class FileUpload extends PureComponent<IProps, IState> {
  state = {
    loading: false,
    fileUrl: ''
  };

  componentDidMount() {
    const { fileUrl } = this.props;
    this.setState({ fileUrl });
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    const { onFileReaded, onUploaded } = this.props;
    if (info.file.status === 'done') {
      onFileReaded && onFileReaded(info.file.originFileObj);
      // Get this url from response in real world.
      this.setState({
        loading: false,
        fileUrl: info.file.response.data ? info.file.response.data.url : 'Done!'
      });
      onUploaded && onUploaded({
        response: info.file.response
      });
    }
  };

  render() {
    const { loading } = this.state;
    const uploadButton = (
      <div>
        {loading ? <LoadingOutlined /> : <FileAddOutlined />}
      </div>
    );
    const { fileUrl } = this.state;
    const {
      headers, uploadUrl, fieldName = 'file', accept
    } = this.props;
    return (
      <Upload
        accept={accept || '*'}
        name={fieldName}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
        headers={headers}
      >
        {fileUrl ? (
          <FileDoneOutlined style={{ fontSize: '28px', color: '#00ce00' }} />
        ) : (
          uploadButton
        )}
      </Upload>
    );
  }
}
