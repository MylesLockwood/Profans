import { PureComponent } from 'react';
import Head from 'next/head';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { productService } from '@services/product.service';
import { IProductUpdate, IUIConfig } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { FormProduct } from '@components/product/form-product';
import Router from 'next/router';
import { connect } from 'react-redux';
import { getResponseError } from '@lib/utils';

interface IProps {
  id: string;
  ui: IUIConfig;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class ProductUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    submitting: false,
    fetching: true,
    product: {} as IProductUpdate,
    uploadPercentage: 0
  };

  _files: {
    image: File;
    digitalFile: File;
  } = {
    image: null,
    digitalFile: null
  };

  async componentDidMount() {
    try {
      const { id } = this.props;
      const resp = await productService.findById(id);
      this.setState({ product: resp.data });
    } catch (e) {
      message.error('Product not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  onUploading(resp: any) {
    if (this._files.image || this._files.digitalFile) {
      this.setState({ uploadPercentage: resp.percentage });
    }
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    try {
      const { id } = this.props;
      const files = Object.keys(this._files).reduce((tmpFiles, key) => {
        if (this._files[key]) {
          tmpFiles.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return tmpFiles;
      }, [] as IFiles[]) as [IFiles];

      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      await productService.update(
        id,
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success('Changes saved.');
      this.setState({ submitting: false }, () => Router.push('/content-creator/my-store'));
    } catch (e) {
      // TODO - check and show error here
      message.error(
        getResponseError(e) || 'Something went wrong, please try again!'
      );
      this.setState({ submitting: false });
    }
  }

  render() {
    const {
      product, submitting, fetching, uploadPercentage
    } = this.state;
    const { ui } = this.props;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Update Product
          </title>
        </Head>
        <div className="main-container">
          <Page>
            {fetching ? (
              <Loader />
            ) : (
              <>
                <h4 className="title-form">Update product</h4>
                <FormProduct
                  product={product}
                  submit={this.submit.bind(this)}
                  uploading={submitting}
                  beforeUpload={this.beforeUpload.bind(this)}
                  uploadPercentage={uploadPercentage}
                />
              </>
            )}
          </Page>
        </div>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ProductUpdate);
