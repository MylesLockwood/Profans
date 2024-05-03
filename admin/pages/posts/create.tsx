import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';

import dynamic from 'next/dynamic';
import {
  Form, Input, Select, Button, Breadcrumb, message, InputNumber
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { postService } from '@services/post.service';
import Router from 'next/router';

const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});
class PostCreate extends PureComponent<any> {
  private _content: string = '';

  state = {
    submitting: false
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    if (!query.type) {
      query.type = 'post';
    }
    return query;
  }

  async submit(data: any) {
    const { type } = this.props;

    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data,
        content: this._content,
        type
      };
      await postService.create(submitData);
      message.success('Created successfully');
      // TODO - redirect
      Router.push(
        {
          pathname: '/posts'
        },
        '/posts'
      );
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
    } finally {
      this.setState({ submitting: false });
    }
  }

  contentChange(content: { [html: string]: string }) {
    this._content = content.html;
  }

  render() {
    const { submitting } = this.state;
    return (
      <>
        <Head>
          <title>Create new page</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/posts">
              <span>Static pages</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create new page</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          <Form
            onFinish={this.submit.bind(this)}
            initialValues={{
              title: '',
              shortDescription: '',
              status: 'published',
              ordering: 0
            }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item name="title" rules={[{ required: true, message: 'Please input title!' }]} label="Title">
              <Input placeholder="Enter your title" />
            </Form.Item>

            <Form.Item name="slug" label="Slug">
              <Input placeholder="Custom friendly slug" />
            </Form.Item>
            <Form.Item name="ordering" label="Ordering">
              <InputNumber />
            </Form.Item>
            <Form.Item name="shortDescription" label="Short description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Content">
              <WYSIWYG onChange={this.contentChange.bind(this)} html={this._content} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="published">Active</Select.Option>
                <Select.Option value="draft">Inactive</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button type="primary" htmlType="submit" style={{ float: 'right' }} loading={submitting}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </>
    );
  }
}

export default PostCreate;
