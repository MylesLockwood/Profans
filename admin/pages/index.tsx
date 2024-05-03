import Head from 'next/head';
import {
  Row, Col, Statistic, Card
} from 'antd';
import { PureComponent } from 'react';
import { utilsService } from '@services/utils.service';
import {
  AreaChartOutlined, PieChartOutlined, BarChartOutlined,
  DotChartOutlined, LineChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';

export default class Dashboard extends PureComponent<any> {
  state = {
    stats: {
      totalActivePerformers: 0,
      totalActiveSubscribers: 0,
      totalActiveUsers: 0,
      totalDeliveriedOrders: 0,
      totalGrossPrice: 0,
      totalInactivePerformers: 0,
      totalInactiveUsers: 0,
      totalNetPrice: 0,
      totalOrders: 5,
      totalPendingPerformers: 0,
      totalPendingUsers: 0,
      totalPosts: 0,
      totalPhotoPosts: 0,
      totalVideoPosts: 0,
      totalRefundedOrders: 0,
      totalShippingdOrders: 0,
      totalSubscribers: 0,
      totalProducts: 0
    }
  }

  async componentDidMount() {
    const stats = await (await utilsService.statistics()).data;
    if (stats) {
      this.setState({ stats });
    }
  }

  render() {
    const { stats } = this.state;
    return (
      <>
        <Head>
          <title>Dashboard</title>
        </Head>
        <Row gutter={24} className="dashboard-stats">
          <Col md={8} xs={12}>
            <Link href="/users">
              <a>
                <Card>
                  <Statistic
                    title="ACTIVE USERS"
                    value={stats.totalActiveUsers}
                    valueStyle={{ color: '#ffc107' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/users">
              <a>
                <Card>
                  <Statistic
                    title="INACTIVE USERS"
                    value={stats.totalInactiveUsers}
                    valueStyle={{ color: '#ffc107' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/users">
              <a>
                <Card>
                  <Statistic
                    title="PEDNING VERIFIED EMAIL USERS"
                    value={stats.totalPendingUsers}
                    valueStyle={{ color: '#ffc107' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/content-creator">
              <a>
                <Card>
                  <Statistic
                    title="ACTIVE CREATORS"
                    value={stats.totalActivePerformers}
                    valueStyle={{ color: '#009688' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </a>
            </Link>

          </Col>
          <Col md={8} xs={12}>
            <Link href="/content-creator">
              <a>
                <Card>
                  <Statistic
                    title="INACTIVE CREATORS"
                    value={stats.totalInactivePerformers}
                    valueStyle={{ color: '#009688' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/content-creator">
              <a>
                <Card>
                  <Statistic
                    title="PENDING VERIFIED CREATORS"
                    value={stats.totalPendingPerformers}
                    valueStyle={{ color: '#009688' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/feed">
              <a>
                <Card>
                  <Statistic
                    title="POSTS"
                    value={stats.totalPosts}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/feed?type=video">
              <a>
                <Card>
                  <Statistic
                    title="PHOTO POSTS"
                    value={stats.totalPhotoPosts}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>

          <Col md={8} xs={12}>
            <Link href="/video">
              <a>
                <Card>
                  <Statistic
                    title="VIDEO POSTS"
                    value={stats.totalVideoPosts}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<DotChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/product">
              <a>
                <Card>
                  <Statistic
                    title="PRODUCTS"
                    value={stats.totalProducts}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/earning">
              <a>
                <Card>
                  <Statistic
                    title="GROSS PROFIT"
                    value={`$${stats?.totalGrossPrice.toFixed(2)}`}
                    valueStyle={{ color: '#fb2b2b' }}
                    prefix={<DotChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/earning">
              <a>
                <Card>
                  <Statistic
                    title="NET PROFIT"
                    value={`$${stats?.totalNetPrice.toFixed(2)}`}
                    valueStyle={{ color: '#fb2b2b' }}
                    prefix={<DotChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order">
              <a>
                <Card>
                  <Statistic
                    title="SHIPPING ORDERS"
                    value={stats.totalShippingdOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order">
              <a>
                <Card>
                  <Statistic
                    title="DELIVERIED ORDERS"
                    value={stats.totalDeliveriedOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order">
              <a>
                <Card>
                  <Statistic
                    title="REFUNDED ORDERS"
                    value={stats.totalRefundedOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
        </Row>
      </>
    );
  }
}
