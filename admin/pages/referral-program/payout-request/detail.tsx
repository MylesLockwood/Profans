/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  Layout, message, Select, Button, PageHeader,
  Input, Space, Statistic, Divider, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { IPayoutRequest } from 'src/interfaces';
import { BreadcrumbComponent } from '@components/common/breadcrumb';
import Page from '@components/common/layout/page';
import { payoutRequestService } from 'src/services';
import Router from 'next/router';
import { getResponseError } from '@lib/utils';
import { formatDate } from 'src/lib/date';

const { Content } = Layout;

interface IProps {
  id: string;
}

class PayoutDetailPage extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    request: {} as IPayoutRequest,
    loading: false,
    submiting: false,
    status: '',
    adminNote: '',
    statsPayout: {
      totalEarnings: 0,
      previousPaidOut: 0,
      remainingUnpaid: 0
    }
  };

  componentDidMount() {
    this.getData();
  }

  async onUpdate() {
    const { status, adminNote, request } = this.state;
    try {
      await this.setState({ submiting: true });
      await payoutRequestService.update(request._id, {
        status,
        adminNote
      });
      message.success('Updated successfully');
      Router.back();
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err), 10);
    } finally {
      this.setState({ submiting: false });
    }
  }

  async getData() {
    const { id } = this.props;
    try {
      await this.setState({ loading: true });
      const resp = await payoutRequestService.detail(id);
      await this.getStatsPayout(resp.data.sourceId);
      await this.setState({
        request: resp.data,
        status: resp.data.status,
        adminNote: resp.data.adminNote
      });
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    }
  }

  async getStatsPayout(sourceId: string) {
    try {
      const resp = await payoutRequestService.calculate({
        sourceId
      });
      this.setState({ statsPayout: resp.data });
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      request, adminNote, loading, submiting, statsPayout, status
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>Request Details</title>
        </Head>
        <Content>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Payout Requests', href: '/payout-request' },
                {
                  title: 'Request Details'
                }
              ]}
            />
            {request && !loading && (
              <Page>
                <PageHeader title="Payout Request Informations" />
                <div style={{ margin: '20px 0', textAlign: 'center', width: '100%' }}>
                  <Space size="large">
                    <Statistic
                      prefix="$"
                      title="Total profit"
                      value={statsPayout?.totalEarnings || 0}
                      precision={2}
                    />
                    <Statistic
                      prefix="$"
                      title="Previous paid out"
                      value={statsPayout?.previousPaidOut || 0}
                      precision={2}
                    />
                    <Statistic
                      prefix="$"
                      title="Remaining unpaid"
                      value={statsPayout?.remainingUnpaid || 0}
                      precision={2}
                    />
                  </Space>
                </div>
                <p>
                  Requestor:
                  {' '}
                  <strong>
                    {request?.sourceInfo?.name || request?.sourceInfo?.username || 'N/A'}
                    {' '}
                    (
                    {request?.source || 'user'}
                    )
                  </strong>
                </p>
                <p>
                  Request price:
                  {' '}
                  $
                  {(request.requestPrice || 0)}
                </p>
                <p>
                  From Date:
                  {' '}
                  {formatDate(request.fromDate, 'LL')}
                </p>
                <p>
                  To Date:
                  {' '}
                  {formatDate(request.toDate, 'LL')}
                </p>
                <p>
                  Requested at:
                  {' '}
                  {formatDate(request.createdAt)}
                </p>
                <p>
                  User Note:
                  {' '}
                  {request.requestNote}
                </p>
                <Divider>
                  {(request?.paymentAccountType || '').toUpperCase()}
                  {' '}
                  INFORMATIONS
                </Divider>
                {request?.paymentAccountType === 'paypal' ? (
                  <div>
                    Email address:
                    {' '}
                    {request?.paymentAccountInfo?.emailAddress}
                  </div>
                ) : (
                  <div>
                    {request?.paymentAccountInfo && Object.keys(request?.paymentAccountInfo).map((key) => {
                      if (['_id', 'source', 'sourceId', '__v', 'createdAt', 'updatedAt'].includes(key)) return null;
                      return (
                        <p>
                          {(key || '').toUpperCase()}
                          :
                          {' '}
                          {request.paymentAccountInfo[key]}
                        </p>
                      );
                    })}
                  </div>
                )}
                <Divider />
                <div style={{ marginBottom: '10px' }}>
                  <p>
                    Update status here
                  </p>
                  <Select
                    disabled={loading || ['done', 'rejected'].includes(request?.status)}
                    style={{ width: '100%' }}
                    onChange={(e) => this.setState({ status: e })}
                    value={status}
                  >
                    {/* <Select.Option key="approved" value="approved">
                          Approved
                        </Select.Option> */}
                    <Select.Option key="pending" value="pending">
                      Pending
                    </Select.Option>
                    <Select.Option key="rejected" value="rejected">
                      Rejected
                    </Select.Option>
                    <Select.Option key="done" value="done">
                      Done
                    </Select.Option>
                  </Select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <p>Note to user: </p>
                  <Input.TextArea
                    defaultValue={adminNote}
                    style={{ width: '100%' }}
                    onChange={(v) => {
                      this.setState({ adminNote: v.target.value });
                    }}
                    placeholder="Text something to user"
                    autoSize={{ minRows: 3 }}
                  />
                </div>
                <div style={{ marginBottom: '10px', display: 'flex' }}>
                  <Button
                    type="primary"
                    disabled={submiting}
                    loading={submiting}
                    onClick={this.onUpdate.bind(this)}
                  >
                    Update
                  </Button>
                  &nbsp;
                  <Button
                    type="default"
                    disabled={submiting}
                    onClick={() => Router.back()}
                  >
                    Back
                  </Button>
                </div>
              </Page>
            )}
            {loading && <div className="text-center"><Spin /></div>}
            {!loading && !request && (
              <p>Request not found.</p>
            )}
          </div>
        </Content>
      </Layout>
    );
  }
}

export default PayoutDetailPage;
