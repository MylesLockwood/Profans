import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import FormFeed from '@components/feed/feed-form';
import { BreadcrumbComponent } from '@components/common';

class FeedCreate extends PureComponent {
  render() {
    return (
      <>
        <Head>
          <title>Create new post</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Feed', href: '/feed' }, { title: 'Create new post' }]}
        />
        <Page>
          <FormFeed />
        </Page>
      </>
    );
  }
}

export default FeedCreate;
