/* eslint-disable no-nested-ternary */
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import {
  Table, message, Breadcrumb, Dropdown, Menu, Button
} from 'antd';
import {
  HomeOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { performerCategoryService } from '@services/perfomer-category.service';
import { formatDate } from '@lib/date';
import { SearchFilter } from '@components/performer/category/search-filter';

interface IProps {}

class Categories extends PureComponent<IProps> {
  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'ordering',
    sort: 'asc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async deleteCategory(id: string) {
    const { pagination } = this.state;
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return false;
    }
    try {
      await performerCategoryService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  async search(page = 1) {
    const {
      filter, limit, sort,
      sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await performerCategoryService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: true,
        render(data, record) {
          return (
            <>
              <Link
                href={{
                  pathname: '/content-creator/category/update',
                  query: {
                    id: record._id
                  }
                }}
              >
                <a style={{ fontWeight: 'bold' }}>{record.name}</a>
              </Link>
            </>
          );
        }
      },
      {
        title: 'Ordering',
        dataIndex: 'ordering',
        sorter: true,
        render(ordering: number) {
          return <span>{ordering}</span>;
        }
      },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        render: (id: string) => (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item key="edit">
                  <Link
                    href={{
                      pathname: '/content-creator/category/update',
                      query: { id }
                    }}
                    as={`/content-creator/category/update?id=${id}`}
                  >
                    <a>
                      <EditOutlined />
                      {' '}
                      Update
                    </a>
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key="delete"
                  onClick={this.deleteCategory.bind(this, id)}
                >
                  <span>
                    <DeleteOutlined />
                    {' '}
                    Delete
                  </span>
                </Menu.Item>
              </Menu>
              )}
          >
            <Button>
              Actions
              {' '}
              <DownOutlined />
            </Button>
          </Dropdown>
        )
      }
    ];
    return (
      <>
        <Head>
          <title>Categories</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Categories</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
          <SearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive">
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

export default Categories;
