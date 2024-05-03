import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { BreadcrumbComponent } from '@components/common';
import FormFeed from '@components/feed/feed-form';
import { feedService } from '@services/feed.service';

interface IProps {
    id: string;
}

class FeedUpdate extends PureComponent<IProps> {
    state = {
      feed: null
    };

    static async getInitialProps({ ctx }) {
      return ctx.query;
    }

    componentDidMount() {
      this.getFeed();
    }

    async getFeed() {
      const { id } = this.props;
      try {
        const resp = await (await feedService.findById(id)).data;
        this.setState({ feed: resp });
      } catch (e) {
        message.error('Error occured');
      }
    }

    render() {
      const { feed } = this.state;
      return (
        <>
          <Head>
            <title>Edit Post</title>
          </Head>
          <BreadcrumbComponent
            breadcrumbs={[
              { title: 'Posts', href: '/feed' },
              { title: 'Edit' }
            ]}
          />
          <Page>
            {feed && (
            <FormFeed
              feed={feed}
            />
            )}
          </Page>
        </>
      );
    }
}

export default FeedUpdate;
