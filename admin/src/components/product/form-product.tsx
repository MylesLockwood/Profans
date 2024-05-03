/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { PureComponent, createRef } from 'react';
import {
  Form, Input, InputNumber, Select, Upload, Button, message, Progress
} from 'antd';
import { IProductCreate, IProductUpdate } from 'src/interfaces';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
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
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
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
    const { beforeUpload: handleUpload } = this.props;
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
    handleUpload(file, field);
    return false;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      product, submit, uploading, uploadPercentage
    } = this.props;
    const { previewImageProduct, isDigitalProduct, digitalProductName } = this.state;
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
            price: 0,
            description: '',
            status: 'active',
            performerId: '',
            stock: 0,
            type: 'physical'
          } as IProductCreate)
        }
      >
        <Form.Item name="performerId" label="Content creator" rules={[{ required: true }]}>
          <SelectPerformerDropdown
            disabled={haveProduct}
            defaultValue={product && product.performerId}
            onSelect={(val) => this.setFormVal('performerId', val)}
          />
        </Form.Item>
        <Form.Item name="name" rules={[{ required: true, message: 'Please input name of product!' }]} label="Name">
          <Input placeholder="Enter product name" />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select type!' }]}>
          <Select onChange={(val) => this.setFormVal('type', val)}>
            <Select.Option key="physical" value="physical">
              Physical
            </Select.Option>
            <Select.Option key="digital" value="digital">
              Digital
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="price" label="Price">
          <InputNumber min={1} />
        </Form.Item>
        {!isDigitalProduct && (
        <Form.Item name="stock" label="Stock">
          <InputNumber min={1} />
        </Form.Item>
        )}
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div key="image" className="ant-row ant-form-item">
          <div className="ant-col ant-col-24 ant-form-item-label">
            <label>Image</label>
          </div>
          <div className="ant-col ant-col-24 ant-form-item-control">
            <Upload
              accept="image/*"
              multiple={false}
              showUploadList={false}
              disabled={uploading}
              beforeUpload={(file) => this.beforeUpload(file, 'image')}
            >
              {previewImageProduct ? (
                <img src={previewImageProduct} alt="file" style={{ width: '250px', marginBottom: '10px' }} />
              ) : product ? (
                <ImageProduct product={product} style={{ width: '250px', marginBottom: '10px' }} />
              ) : null}
              <div style={{ clear: 'both' }} />
              <Button>
                <UploadOutlined />
                {' '}
                Select File
              </Button>
            </Upload>
          </div>
        </div>
        {isDigitalProduct && (
        <div key="digital-product" className="ant-row ant-form-item">
          <div className="ant-col ant-col-24 ant-form-item-label">
            <label>Digital File</label>
          </div>
          <div className="ant-col ant-col-24 ant-form-item-control">
            <Upload
              multiple={false}
              showUploadList={false}
              disabled={uploading || haveProduct}
              beforeUpload={(file) => this.beforeUpload(file, 'digitalFile')}
            >
              {digitalProductName && (
              <div className="ant-upload-list ant-upload-list-picture" style={{ marginBottom: 10 }}>
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
              <div style={{ clear: 'both' }} />
              <Button>
                <UploadOutlined />
                {' '}
                Select File
              </Button>
            </Upload>
            {uploadPercentage ? <Progress percent={uploadPercentage} /> : null}
          </div>
        </div>
        )}
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={uploading}>
            {haveProduct ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
