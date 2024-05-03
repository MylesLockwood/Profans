/* eslint-disable no-empty */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/destructuring-assignment */
import { PureComponent } from 'react';
import {
  Form, Button, Row, Col
} from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { IPerformerUpdate } from 'src/interfaces';
import { performerService, authService } from '@services/index';
import { FileUpload } from '@components/file/file-upload';
import { ImageUpload } from '@components/file/image-upload';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onUploaded: Function;
  performer?: IPerformerUpdate;
  onFinish?: Function;
  submiting?: boolean;
}
export class PerformerDocument extends PureComponent<IProps> {
  state = {
    idVerificationUrl: '',
    documentVerificationUrl: ''
  };

  componentDidMount() {
    const { performer } = this.props;
    this.setState({
      idVerificationUrl: performer?.idVerification?.url || '',
      documentVerificationUrl: performer?.documentVerification?.url || ''
    });
  }

  render() {
    const {
      onUploaded, onFinish, submiting, performer
    } = this.props;
    const { idVerificationUrl, documentVerificationUrl } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Form {...layout} name="form-performer" onFinish={onFinish.bind(this)}>
        <Row>
          <Col span={24}>
            <Form.Item label="ID verification photo">
              <ImageUpload
                uploadUrl={`${performerService.getUploadDocumentUrl()}/${performer._id}`}
                headers={uploadHeaders}
                onUploaded={(resp) => {
                  this.setState({ idVerificationUrl: resp.response.data.url });
                  onUploaded('idVerificationId', resp);
                }}
              />
              {idVerificationUrl && (
              <a href={idVerificationUrl} target="_.blank" title="Click to view">
                <img src={idVerificationUrl} height="100px" alt="photoVefication" />
                <p>Click to view</p>
              </a>
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Document verification file">
              <FileUpload
                uploadUrl={`${performerService.getUploadDocumentUrl()}/${performer._id}`}
                headers={uploadHeaders}
                onUploaded={(resp) => {
                  this.setState({
                    documentVerificationUrl: resp.response.data.url
                  });
                  onUploaded('documentVerificationId', resp);
                }}
              />
              {documentVerificationUrl && (
              <a href={documentVerificationUrl} target="_.blank" title="Click to view">
                <FileOutlined style={{ fontSize: 50 }} />
                <p>Click to download</p>
              </a>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
