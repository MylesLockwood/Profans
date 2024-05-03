import Head from 'next/head';
import { PureComponent } from 'react';
import {
  Layout
} from 'antd';
import { feedService } from '@services/index';
import Page from '@components/common/layout/page';
import { connect } from 'react-redux';
import { IFeed, IUIConfig } from '@interfaces/index';
import FeedForm from '@components/post/form';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Router from 'next/router';

interface IProps {
  ui: IUIConfig;
  feed: IFeed;
}

class EditPost extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps({ ctx }) {
    try {
      const feed = await (await feedService.findById(ctx.query.id, { Authorization: ctx.token })).data;
      return { feed };
    } catch (e) {
      return { ctx };
    }
  }

  componentDidMount() {
    const { feed } = this.props;
    if (!feed) {
      Router.back();
    }
  }

  render() {
    const { feed, ui } = this.props;
    return (
      <>
        {feed && (
        <Layout>
          <Head>
            <title>
              {ui?.siteName}
              {' '}
              | Edit Post
            </title>
          </Head>
          <div className="main-container">
            <Page>
              <div className="page-heading">
                <a aria-hidden onClick={() => Router.back()}><ArrowLeftOutlined /></a>
                &nbsp;
                <span>Edit Post</span>
              </div>
              <div>
                <FeedForm feed={feed} />
              </div>
            </Page>
          </div>
        </Layout>
        )}
      </>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(EditPost);
