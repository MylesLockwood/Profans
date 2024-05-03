import { PureComponent } from 'react';
import {
  Row, Col, Layout, Pagination, Spin, message
} from 'antd';
import { ModelIcon } from 'src/icons';
import { connect } from 'react-redux';
import PerformerGridCard from '@components/performer/grid-card';
import Head from 'next/head';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import { IUIConfig } from 'src/interfaces/';
import { performerService } from '@services/index';
import '@components/performer/performer.less';

interface IProps {
  ui: IUIConfig;
  query: {
    q: string;
    isFreeSubscription: string;
    country: string;
    gender: string;
    orientation: string;
    ages: string;
    eyes: string;
    hair: string;
    butt: string;
    height: string;
    weight: string;
    ethnicity: string;
    bodyType: string;
  }
}

class Performers extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    return { query };
  }

  state = {
    offset: 0,
    limit: 12,
    filter: {
      sortBy: 'popular'
    } as any,
    performers: [],
    total: 0,
    fetching: true
  };

  async componentDidMount() {
    const { query } = this.props;
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...query } });
    this.getPerformers();
  }

  async handleFilter(values: any) {
    const { filter } = this.state;
    await this.setState({ offset: 0, filter: { ...filter, ...values } });
    this.getPerformers();
  }

  async getPerformers() {
    const {
      limit, offset, filter
    } = this.state;
    try {
      await this.setState({ fetching: true });
      const resp = await performerService.search({
        limit,
        offset: limit * offset,
        ...filter
      });
      this.setState({ performers: resp.data.data, total: resp.data.total, fetching: false });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  pageChanged = async (page: number) => {
    await this.setState({ offset: page - 1 });
    this.getPerformers();
  }

  render() {
    const {
      ui, query
    } = this.props;
    const {
      limit, offset, performers, fetching, total
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Content Creators
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading">
            <ModelIcon />
            {' '}
            Content Creators
          </div>
          <PerformerAdvancedFilter
            defaultValue={query}
            onSubmit={this.handleFilter.bind(this)}
            countries={ui?.countries || []}
          />
          <Row>
            {performers && performers.length > 0
                    && !fetching
                    && performers.map((p: any) => (
                      <Col xs={12} sm={12} md={8} lg={6} key={p._id}>
                        <PerformerGridCard performer={p} />
                      </Col>
                    ))}
          </Row>
          {!total && !fetching && <p className="text-center">No profile was found.</p>}
          {fetching && (
            <div className="text-center">
              <Spin />
            </div>
          )}
          {total && total > limit && !fetching ? (
            <Pagination
              showQuickJumper
              defaultCurrent={offset + 1}
              total={total}
              pageSize={limit}
              onChange={this.pageChanged}
            />
          ) : null}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatch = { };
export default connect(mapStates, mapDispatch)(Performers);
