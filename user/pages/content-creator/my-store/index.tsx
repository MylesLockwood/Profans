import { PureComponent, Fragment } from 'react';
import Head from 'next/head';
import {
  message, Button, Row, Col
} from 'antd';
import Page from '@components/common/layout/page';
import { productService } from '@services/product.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListProduct } from '@components/product/table-list-product';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IPerformer, IUIConfig } from '@interfaces/index';

interface IProps {
  user: IPerformer;
  ui: IUIConfig;
}

class Products extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await productService.search({
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

  async deleteProduct(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return false;
    }
    try {
      const { pagination } = this.state;
      await productService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return true;
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | My Store
          </title>
        </Head>
        <Page>
          <div className="main-container">
            <div className="page-heading">
              <span>My Store</span>
            </div>
            <div>
              <Row>
                <Col xl={21}>
                  <SearchFilter
                    statuses={statuses}
                    onSubmit={this.handleFilter.bind(this)}
                    searchWithKeyword
                  />
                </Col>
                <Col xl={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <Button className="secondary">
                    <Link href="/content-creator/my-store/create">
                      <a>New Product</a>
                    </Link>
                  </Button>
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: '20px' }} />
            <div className="table-responsive">
              <TableListProduct
                dataSource={list}
                rowKey="_id"
                loading={searching}
                pagination={pagination}
                onChange={this.handleTableChange.bind(this)}
                deleteProduct={this.deleteProduct.bind(this)}
              />
            </div>
          </div>
        </Page>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(Products);
