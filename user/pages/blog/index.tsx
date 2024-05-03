/* eslint-disable react/no-danger */
import Head from 'next/head';
import { Layout, message } from 'antd';
import { PureComponent, Fragment } from 'react';
import { blogService } from '@services/index';
import { connect } from 'react-redux';
import { formatDateNoTime } from '@lib/index';
import Loader from '@components/common/base/loader';
import Router from 'next/router';
import Link from 'next/link';
import './index.less';

interface IProps {
  ui: any;
  id: string;
}
class BlogDetail extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    post: null,
    fetching: false
  };

  static async getInitialProps({ ctx }: any) {
    const { query } = ctx;
    return query;
  }

  async componentDidMount() {
    this.getPost();
  }

  async componentDidUpdate(prevProps: IProps) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.getPost();
    }
  }

  async getPost() {
    const { id } = this.props;
    try {
      const resp = await blogService.userFindById(id);
      this.setState({ post: resp.data });
    } catch (e) {
      message.error('Blog not found!');
      Router.back();
    } finally {
      this.setState({ fetching: false });
    }
  }

  render() {
    const { post, fetching } = this.state;
    const { performer } = post;
    const backgroundImage = (post && post.files && post.files.length && post.files[0].url) || '';
    const { ui } = this.props;
    return (
      <>
        <Head>
          <title>
            {`${ui?.siteName} | ${post?.title}`}
          </title>
        </Head>
        <Layout>
          <div className="main-container">
            <div className="page-container">
              <h2 className="blog-heading">{post?.title}</h2>
              <div className="blog-creator">
                <Link href={{ pathname: '/content-creator/profile', query: { username: performer?.username || performer?._id } }} as={`/${performer?.username || performer?._id}`}>
                  <a>
                    <img src={(performer?.avatar) || '/static/no-avatar.png'} width="50px" alt="" />
                    {' '}
                    {performer?.username}
                  </a>
                </Link>
                {' '}
                -
                {' '}
                {formatDateNoTime(post?.updatedAt)}
              </div>
              <div className="blog-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: post?.text }}
                />
              </div>
            </div>
          </div>
          {fetching && <Loader />}
        </Layout>
      </>
    );
  }
}
const mapProps = (state: any) => ({
  ui: { ...state.ui }
});

export default connect(mapProps)(BlogDetail);
