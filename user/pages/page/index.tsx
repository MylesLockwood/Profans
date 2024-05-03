import { PureComponent } from 'react';
import Head from 'next/head';
import { Layout } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { postService } from '@services/post.service';
import { connect } from 'react-redux';
import Router from 'next/router';
import { IPostResponse } from '@interfaces/post';

interface IProps {
  ui: any;
  post: IPostResponse;
}
class PostDetail extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps({ ctx }: any) {
    const { query } = ctx;
    try {
      const post = await (await postService.findById(query.id)).data;
      return { post };
    } catch (e) {
      return Router.replace('/404');
    }
  }

  render() {
    const { ui, post } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${post?.title || ''}`}
          </title>
        </Head>
        <div className="main-container">
          <div className="page-container">
            <div className="page-heading">
              <ReadOutlined />
              {' '}
              {post?.title || ''}
            </div>
            <div
              className="page-content"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: post?.content }}
            />
          </div>
        </div>
      </Layout>
    );
  }
}
const mapProps = (state: any) => ({
  ui: state.ui
});

export default connect(mapProps)(PostDetail);
