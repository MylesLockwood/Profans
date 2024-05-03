/* eslint-disable no-template-curly-in-string */
import { PureComponent } from 'react';
import {
  Form, Button, Row, Col, message, Progress
} from 'antd';
import { IPerformer } from 'src/interfaces';
import { ImageUpload } from '@components/file';
import { performerService, authService } from '@services/index';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import dynamic from 'next/dynamic';
import './performer.less';

const FaceImage = dynamic(() => import('../face-detect/index'));

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export class PerformerVerificationForm extends PureComponent<IProps> {
  idVerificationFileId: string;

  documentVerificationFileId: string;

  enquireHandler: any;

  state = {
    idImage: '',
    documentImage: '',
    isUploading: false,
    idImgProgress: 0,
    documentImgProgress: 0,
    isMobile: false
  }

  componentDidMount() {
    const { user } = this.props;
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile
        });
      }
    });
    if (user.documentVerification) {
      this.documentVerificationFileId = user?.documentVerification?._id;
      this.setState({ documentImage: user?.documentVerification?.url });
    }
    if (user.idVerification) {
      this.idVerificationFileId = user?.idVerification?._id;
      this.setState({ idImage: user?.idVerification?.url });
    }
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  onFileUploaded(type, file) {
    if (file && type === 'idFile') {
      this.idVerificationFileId = file?.response?.data?._id;
      this.setState({ idImage: file?.response?.data.url });
    }
    if (file && type === 'documentFile') {
      this.documentVerificationFileId = file?.response?.data?._id;
      this.setState({ documentImage: file?.response?.data.url });
    }
  }

  async onFaceSelect(type, data) {
    const { file } = data;
    try {
      await this.setState({ isUploading: true });
      const resp = await performerService.uploadDocuments([{ file, fieldname: 'file' }], (progress) => {
        type === 'idFile' && progress.percentage && this.setState({ idImgProgress: progress.percentage });
        type === 'documentFile' && progress.percentage && this.setState({ documentImgProgress: progress.percentage });
      }) as any;
      if (type === 'idFile' && resp.data) {
        this.idVerificationFileId = resp.data._id;
        this.setState({ idImage: resp.data.url });
      }
      if (type === 'documentFile' && resp.data) {
        this.documentVerificationFileId = resp?.data?._id;
        this.setState({ documentImage: resp.data.url });
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, pleasey try again later');
    } finally {
      this.setState({ isUploading: false });
    }
  }

  render() {
    const {
      onFinish, updating
    } = this.props;
    const {
      isUploading, idImage, documentImage, idImgProgress, documentImgProgress,
      isMobile
    } = this.state;
    const documentUploadUrl = performerService.getDocumentUploadUrl();
    const headers = {
      authorization: authService.getToken()
    };
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          if (!this.idVerificationFileId || !this.documentVerificationFileId) {
            return message.error('ID photo & ID document are required', 5);
          }
          const data = { ...values };
          data.idVerificationId = this.idVerificationFileId;
          data.documentVerificationId = this.documentVerificationFileId;
          return onFinish(data);
        }}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="ID photo"
              className="model-photo-verification"
              help="Upload a photo of yourself holding your indentity document next to your face"
            >
              <div className="document-upload">
                {isMobile ? <ImageUpload accept="image/*;capture=camera" headers={headers} uploadUrl={documentUploadUrl} onUploaded={this.onFileUploaded.bind(this, 'idFile')} /> : <FaceImage onOk={this.onFaceSelect.bind(this, 'idFile')} />}
                {idImage && (
                <a title="Click to view" href={idImage} rel="noreferrer" target="_blank">
                  <img alt="id-img" src={idImage} style={{ margin: 5, width: '250px' }} />
                  <p className="text-center"><small>Click to view</small></p>
                </a>
                )}
              </div>
              {idImgProgress > 0 && <Progress percent={idImgProgress} />}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Holding ID photo"
              className="model-photo-verification"
              help="Please upload proof of one of either of the following: social security number or national insurance number or passport or a different photographic id to your photo verification"
            >
              <div className="document-upload">
                {isMobile ? <ImageUpload accept="image/*;capture=camera" headers={headers} uploadUrl={documentUploadUrl} onUploaded={this.onFileUploaded.bind(this, 'documentFile')} /> : <FaceImage onOk={this.onFaceSelect.bind(this, 'documentFile')} />}
                {documentImage && (
                <a title="Click to view" href={documentImage} rel="noreferrer" target="_blank">
                  <img alt="id-img" src={documentImage} style={{ margin: 5, width: '250px' }} />
                  <p className="text-center"><small>Click to view</small></p>
                </a>
                )}
              </div>
              {documentImgProgress > 0 && <Progress percent={documentImgProgress} />}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="primary" type="primary" htmlType="submit" disabled={updating || isUploading} loading={updating || isUploading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
