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
import FeedForm from '@components/post/form';
import { ArrowLeftOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import Router from 'next/router';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
}

class CreatePost extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    chosenType: false,
    type: ''
  }

  componentDidMount() {
    const { user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your ID documents are not verified yet! You could not post any content right now. Please upload your ID documents to get approval then start making money.');
      Router.push('/content-creator/account');
    }
  }

  render() {
    const { ui } = this.props;
    const { chosenType, type } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            { ui?.siteName }
            {' '}
            | New Post
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a onClick={() => Router.back()}><ArrowLeftOutlined /></a>
              &nbsp;
              <span>New Post</span>
            </div>
            <div>
              {!chosenType ? (
                <div className="story-switch-type">
                  <div aria-hidden className="type-item left" onClick={() => this.setState({ type: 'photo', chosenType: true })}>
                    <span><PictureOutlined /></span>
                    <p>Create a Photos post</p>
                  </div>
                  <div aria-hidden className="type-item right" onClick={() => this.setState({ type: 'video', chosenType: true })}>
                    <span><VideoCameraOutlined /></span>
                    <p>Create a Video post</p>
                  </div>
                  <div aria-hidden className="type-item middle" onClick={() => this.setState({ type: 'text', chosenType: true })}>
                    <span>Aa</span>
                    <p>Create a Text post</p>
                  </div>
                </div>
              ) : (<FeedForm type={type} discard={() => this.setState({ chosenType: false, type: '' })} />)}
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
export default connect(mapStates)(CreatePost);
