/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import Head from 'next/head';
import { PureComponent } from 'react';
import {
  Layout, message
} from 'antd';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import { IPerformer, IUIConfig } from '@interfaces/index';
import BlogForm from '@components/blog/form';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Router from 'next/router';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
}

class CreateBlog extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your ID documents are not verified yet! You could not post any content right now. Please upload your ID documents to get approval then start making money.');
      Router.push('/content-creator/account');
    }
  }

  render() {
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui?.siteName}
            {' '}
            | New Blog
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a onClick={() => Router.back()}><ArrowLeftOutlined /></a>
              &nbsp;
              <span>New Blog</span>
            </div>
            <div>
              <BlogForm />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});
export default connect(mapStates)(CreateBlog);
