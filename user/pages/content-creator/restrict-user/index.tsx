import {
  Layout, Button, message, Modal
} from 'antd';
import Head from 'next/head';
import React, { PureComponent } from 'react';
import { BlockOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import { blockService } from 'src/services';
import UsersBlockList from '@components/block-user/block-list';
import BlockUserForm from '@components/block-user/block-form';
import Router from 'next/router';
import './index.less';

interface IProps {
  ui: IUIConfig;
  className: string;
}

class blockPage extends PureComponent<IProps> {
  static onlyPerformer = true;

  static authenticate = true;

  state = {
    loading: false,
    submiting: false,
    limit: 10,
    offset: 0,
    userBlockedList: [],
    totalBlockedUsers: 0,
    openBlockModal: false
  }

  componentDidMount() {
    this.getBlockList();
  }

  async handleTabChange(data) {
    await this.setState({ offset: data.current - 1 });
    this.getBlockList();
  }

  async handleUnblockUser(userId: string) {
    if (!window.confirm('Are you sure to unblock this user')) return;
    const { userBlockedList } = this.state;
    try {
      await this.setState({ submiting: true });
      await blockService.unBlockUser(userId);
      this.setState({ submiting: false, userBlockedList: userBlockedList.filter((u) => u.targetId !== userId) });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occured. Please try again later');
      this.setState({ submiting: false });
    }
  }

  async getBlockList() {
    const { limit, offset } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await blockService.getBlockListUsers({
        limit,
        offset: offset * limit
      });
      this.setState({
        loading: false,
        userBlockedList: resp.data.data,
        totalBlockedUsers: resp.data.total
      });
    } catch (e) {
      message.error('An error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  async blockUser(data: any) {
    const { targetId } = data;
    if (!targetId) {
      message.error('Please select a user');
      return;
    }
    try {
      await this.setState({ submiting: true });
      await blockService.blockUser({ targetId, target: 'user', reason: data.reason || '' });
      message.success('Blocked successfully');
      this.getBlockList();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openBlockModal: false });
    }
  }

  render() {
    const {
      userBlockedList, totalBlockedUsers, loading, limit, submiting, openBlockModal
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Restricted Users`}</title>
        </Head>
        <div className="main-container">
          <div className="page-heading">
            <BlockOutlined />
            {' '}
            Restricted Users
          </div>
          <div className="block-user">
            <Button className="" type="primary" onClick={() => this.setState({ openBlockModal: true })}>
              Click here to block
            </Button>
          </div>
          <div className="users-blocked-list">
            <UsersBlockList
              items={userBlockedList}
              searching={loading}
              total={totalBlockedUsers}
              onPaginationChange={this.handleTabChange.bind(this)}
              pageSize={limit}
              submiting={submiting}
              unblockUser={this.handleUnblockUser.bind(this)}
            />
          </div>
        </div>
        <Modal
          title="Block user"
          visible={openBlockModal}
          onCancel={() => this.setState({ openBlockModal: false })}
          footer={null}
          destroyOnClose
        >
          <BlockUserForm onFinish={this.blockUser.bind(this)} submiting={submiting} />
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(blockPage);
