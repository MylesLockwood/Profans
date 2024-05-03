import Head from 'next/head';
import { PureComponent } from 'react';
import {
  message, Layout
} from 'antd';
import { feedService } from '@services/index';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import {
  IFeed, IUIConfig, IUser
} from '@interfaces/index';
import FeedCard from '@components/post/post-card';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Router from 'next/router';
import Error from 'next/error';

interface IProps {
  error: any;
  ui: IUIConfig;
  feed: IFeed;
  user: IUser;
}

class PostDetails extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps({ ctx }) {
    try {
      const feed = await (await feedService.findOne(ctx.query.id, { Authorization: ctx.token })).data;
      return { feed };
    } catch (e) {
      return { error: await e };
    }
  }

  async onDelete(feed: IFeed) {
    const { user } = this.props;
    if (user._id !== feed.fromSourceId) {
      message.error('Permission denied');
      return;
    }
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      Router.back();
    } catch {
      message.error('Something went wrong, please try again later');
    }
  }

  render() {
    const { feed, ui, error } = this.props;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Not found'} />;
    }
    const { performer } = feed;
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${performer?.name || performer?.username}`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.name}, ${performer?.username}, ${feed?.text}`}
          />
          <meta
            name="description"
            content={feed?.text}
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui?.siteName} | ${performer?.name || performer?.username}`}
          />
          <meta property="og:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta
            property="og:description"
            content={feed?.text}
          />
          {/* Twitter tags */}
          <meta
            name="twitter:title"
            content={`${ui?.siteName} | ${performer?.name || performer?.username}`}
          />
          <meta name="twitter:image" content={performer?.avatar || '/static/no-avatar.png'} />
          <meta
            name="twitter:description"
            content={feed?.text}
          />
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a aria-hidden onClick={() => Router.back()}>
                <ArrowLeftOutlined />
                {' '}
                Back
              </a>
            </div>
            <div className="main-container custom">
              <FeedCard feed={feed} onDelete={this.onDelete.bind(this)} />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: state.user.current
});
const dispatch = { };
export default connect(mapStates, dispatch)(PostDetails);
