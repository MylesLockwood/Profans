/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import Head from 'next/head';
import { PureComponent } from 'react';
import {
  Layout
} from 'antd';
import { blogService } from '@services/index';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import { IBlog, IUIConfig } from '@interfaces/index';
import BlogForm from '@components/blog/form';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Router from 'next/router';

interface IProps {
  ui: IUIConfig;
  blog: IBlog;
}

class EditBlog extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps({ ctx }) {
    try {
      const blog = await (await blogService.findById(ctx.query.id, { Authorization: ctx.token })).data;
      return { blog };
    } catch (e) {
      return { ctx };
    }
  }

  render() {
    const { blog, ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui?.siteName}
            {' '}
            | Edit Blog
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a onClick={() => Router.back()}><ArrowLeftOutlined /></a>
              &nbsp;
              <span>Edit Blog</span>
            </div>
            <div>
              <BlogForm blog={blog} />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(EditBlog);
