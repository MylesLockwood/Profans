/* eslint-disable no-nested-ternary */
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import {
  Table, message, Tag, Avatar
} from 'antd';
import Page from '@components/common/layout/page';
import { performerService } from '@services/performer.service';
import { SearchFilter } from '@components/performer/search-filter';
import {
  EditOutlined,
  FireOutlined,
  DeleteOutlined,
  SkinOutlined
} from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { BreadcrumbComponent, DropdownAction } from '@components/common';

export default class Performers extends PureComponent<any> {
  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  async handleTableChange(pagination, filters, sorter) {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  }

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async handleDelete(performer) {
    const { pagination } = this.state;
    if (!window.confirm(`Are you sure to delete ${performer?.name || performer?.username || 'this content creator'}`)) return;
    try {
      await performerService.delete(performer._id);
      this.search(pagination.current);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  async search(page = 1) {
    const {
      limit, sort, filter, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });

      const resp = await performerService.search({
        limit,
        offset: (page - 1) * limit,
        ...filter,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const {
      list, searching, pagination
    } = this.state;
    const onDelete = this.handleDelete.bind(this);
    const columns = [
      {
        title: '#',
        render(performer) {
          return <Avatar src={performer?.avatar || '/no-avatar.png'} />;
        }
      },
      {
        title: 'Display name',
        dataIndex: 'name',
        render(name: string) {
          return <span>{name}</span>;
        }
      },
      {
        title: 'Username',
        dataIndex: 'username'
      },
      {
        title: 'Email',
        dataIndex: 'email'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Deactive</Tag>;
            case 'pending-email-confirmation':
              return <Tag color="default">Pending Email</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'Verified ID',
        dataIndex: 'verifiedDocument',
        render(verifiedDocument) {
          switch (verifiedDocument) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
            default: return <Tag color="red">N</Tag>;
          }
        }
      },
      {
        title: 'Verified Email',
        dataIndex: 'verifiedEmail',
        render(verifiedEmail) {
          switch (verifiedEmail) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
            default: return <Tag color="default">{verifiedEmail}</Tag>;
          }
        }
      },
      {
        title: 'Verified Account',
        dataIndex: 'verifiedAccount',
        render(status) {
          switch (status) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'Created at',
        dataIndex: 'createdAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: '#',
        dataIndex: '_id',
        render(id: string, record) {
          return (
            <DropdownAction
              menuOptions={[
                {
                  key: 'update',
                  name: 'Update',
                  children: (
                    <Link
                      href={{
                        pathname: '/content-creator/update',
                        query: { id }
                      }}
                      as={`/content-creator/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined />
                        {' '}
                        Update
                      </a>
                    </Link>
                  )
                },
                {
                  key: 'delete',
                  name: 'Delete',
                  children: (
                    <a aria-hidden onClick={() => onDelete(record)}>
                      <DeleteOutlined />
                      {' '}
                      Delete
                    </a>
                  )
                },
                {
                  key: 'posts',
                  name: 'Posts',
                  children: (
                    <Link
                      href={{
                        pathname: '/feed',
                        query: { performerId: id }
                      }}
                      as={`/feed?performerId=${id}`}
                    >
                      <a>
                        <FireOutlined />
                        {' '}
                        All Posts
                      </a>
                    </Link>
                  )
                },
                {
                  key: 'product',
                  name: 'Products',
                  children: (
                    <Link
                      href={{
                        pathname: '/product',
                        query: { performerId: id }
                      }}
                      as={`/product?performerId=${id}`}
                    >
                      <a>
                        <SkinOutlined />
                        {' '}
                        Products
                      </a>
                    </Link>
                  )
                }
              ]}
            />
          );
        }
      }
    ];
    return (
      <>
        <Head>
          <title>Content creators</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Content Creators' }]} />
        <Page>
          <SearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive custom">
            <Table
              dataSource={list}
              columns={columns}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
            />
          </div>
        </Page>
      </>
    );
  }
}
