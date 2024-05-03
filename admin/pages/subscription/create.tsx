import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { FormSubscription } from '@components/subscription/form-subscription';
import { BreadcrumbComponent } from '@components/common';
import Router from 'next/router';
import { subscriptionService } from '@services/subscription.service';

class SubscriptionCreate extends PureComponent {
  state = {
    submitting: false
  };

  async submit(data) {
    try {
      this.setState({ submitting: true });
      await subscriptionService.create(data);
      message.success('Created successfully');
      // TODO - redirect
      this.setState(
        {
          submitting: false
        },
        () => window.setTimeout(() => {
          Router.push(
            {
              pathname: '/subscription'
            },
            '/subscription'
          );
        }, 1000)
      );
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { submitting } = this.state;
    return (
      <>
        <Head>
          <title>New subscription</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Subscriptions', href: '/subscription' }, { title: 'New subscription' }]}
        />
        <Page>
          <FormSubscription onFinish={this.submit.bind(this)} submitting={submitting} />
        </Page>
      </>
    );
  }
}

export default SubscriptionCreate;
