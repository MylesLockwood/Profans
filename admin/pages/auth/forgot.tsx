import {
  Form, Input, Button, Row
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import './index.less';
import Head from 'next/head';
import Link from 'next/link';

const FormItem = Form.Item;

interface IProps {
  auth: any;
  ui: any;
}

class Forgot extends PureComponent<IProps> {
  static layout: string = 'public';

  static authenticate: boolean = false;

  state = {
    loading: false
  };

  render() {
    const { ui } = this.props;
    const { siteName, logo } = ui;
    const { loading } = this.state;
    return (
      <>
        <Head>
          <title>Forgot password</title>
        </Head>
        <div className="form" style={{ height: '240px' }}>
          <div className="logo">
            <img alt="logo" src={logo} />
            <span>{siteName}</span>
          </div>
          <Form
            onFinish={null}
          >
            <FormItem
              hasFeedback
              // label="Username"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email' }
              ]}
            >
              <Input
                onPressEnter={null}
                placeholder="youremail@example.com"
              />
            </FormItem>
            <Row>
              <Button
                type="primary"
                onClick={null}
                loading={loading}
                htmlType="submit"
              >
                Submit
              </Button>
            </Row>
          </Form>
          <p>
            <Link href="/auth/login">
              <a style={{ float: 'right' }}>Login</a>
            </Link>
          </p>
        </div>
        <div className="footer">Copy right</div>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(Forgot);
