/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
import { PureComponent, createRef, Fragment } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Progress,
  Row,
  Col
} from 'antd';
import { IProductCreate, IProductUpdate } from 'src/interfaces';
import { FileOutlined, CameraOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { ImageProduct } from '@components/product/image-product';

interface IProps {
  product?: IProductUpdate;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormProduct extends PureComponent<IProps> {
  state = {
    previewImageProduct: null,
    isDigitalProduct: false,
    digitalProductName: ''
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { product } = this.props;
    if (product && product.type === 'digital') {
      this.setState({
        isDigitalProduct: true
      });
    }
  }

  onChangeNumber(field: string, val: number) {
    if (val < 1) {
      message.error(`${field} must be greater than or equal 1`);
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'type') {
      this.setState({ isDigitalProduct: val === 'digital' });
    }
  }

  beforeUpload(file, field) {
    if (field === 'image') {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ previewImageProduct: reader.result }));
      reader.readAsDataURL(file);
    }
    if (field === 'digitalFile') {
      this.setState({
        digitalProductName: file.name
      });
    }
    this.props.beforeUpload(file, field);
    return false;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      product, submit, uploading, uploadPercentage
    } = this.props;
    const {
      previewImageProduct,
      isDigitalProduct,
      digitalProductName
    } = this.state;
    const haveProduct = !!product;
    return (
      <Form
        {...layout}
        onFinish={submit && submit.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          product || ({
            name: '',
            price: 1,
            description: '',
            status: 'active',
            performerId: '',
            stock: 1,
            type: 'physical'
          } as IProductCreate)
        }
        className="account-form"
      >
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input name of product!' }]}
              label="Name"
              labelCol={{ span: 24 }}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: 'Price is required!' }]}
            >
              <InputNumber min={1} onChange={this.onChangeNumber.bind(this, 'Price')} />
            </Form.Item>
            <Form.Item name="stock" labelCol={{ span: 24 }} label="Stock" rules={[{ required: true, message: 'Stock is required!' }]}>
              <InputNumber min={1} onChange={this.onChangeNumber.bind(this, 'Stock')} />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select type!' }]}
            >
              <Select onChange={(val) => this.setFormVal('type', val)}>
                <Select.Option key="physical" value="physical">
                  Physical
                </Select.Option>
                <Select.Option key="digital" value="digital">
                  Digital
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item name="description" labelCol={{ span: 24 }} label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <>
              <div key="image" className="ant-form-item">
                <label>Image</label>
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  className="avatar-uploader"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  beforeUpload={(file) => this.beforeUpload(file, 'image')}
                >
                  {previewImageProduct ? (
                    <img
                      src={previewImageProduct}
                      alt="file"
                      style={{ width: '100px' }}
                    />
                  ) : product ? (
                    <ImageProduct
                      product={product}
                      style={{ width: '100px' }}
                    />
                  ) : null}
                  <CameraOutlined />
                </Upload>
              </div>
              {isDigitalProduct && (
                <div key="digital-product" className="ant-form-item">
                  <label>Add digital product delivery file</label>
                  <Upload
                    listType="picture-card"
                    className="avatar-uploader"
                    multiple={false}
                    showUploadList={false}
                    disabled={uploading}
                    beforeUpload={(file) => this.beforeUpload(file, 'digitalFile')}
                  >
                    {digitalProductName && (
                      <div
                        className="ant-upload-list ant-upload-list-picture"
                        style={{ marginBottom: 10 }}
                      >
                        <div className="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-picture">
                          <div className="ant-upload-list-item-info">
                            <span>
                              <a className="ant-upload-list-item-thumbnail">
                                <FileOutlined />
                              </a>
                              <a className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                                {digitalProductName}
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <CameraOutlined />
                  </Upload>
                  {uploadPercentage ? (
                    <Progress percent={Math.round(uploadPercentage)} />
                  ) : null}
                </div>
              )}
            </>
          </Col>
        </Row>
        {/* <Form.Item name="free" label="Free">
          <Switch checked={false} />
        </Form.Item> */}
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button
            className="primary"
            type="primary"
            htmlType="submit"
            loading={uploading}
            disabled={uploading}
          >
            {haveProduct ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
