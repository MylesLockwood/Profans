import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { couponService } from '@services/coupon.service';
import { FormCoupon } from '@components/coupon/form-coupon';
import { BreadcrumbComponent } from '@components/common';
import Router from 'next/router';

class CouponCreate extends PureComponent {
  state = {
    submitting: false
  };

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data,
        value: data.value
      };
      await couponService.create(submitData);
      message.success('Created successfully');
      // TODO - redirect
      await this.setState(
        {
          submitting: false
        },
        () => window.setTimeout(() => {
          Router.push(
            {
              pathname: '/coupon'
            },
            '/coupon'
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
          <title>Create new coupon</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Coupons', href: '/coupon' }, { title: 'Create new coupon' }]} />
        <Page>
          <FormCoupon onFinish={this.submit.bind(this)} submitting={submitting} />
        </Page>
      </>
    );
  }
}

export default CouponCreate;
