import { PureComponent } from 'react';
import {
  Alert, Row, Col, Spin
} from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IBlog } from '@interfaces/index';
import BlogCard from './blog-card';

interface IProps {
  items: IBlog[];
  loading: boolean;
  canLoadmore: boolean;
  loadMore: Function;
  onDelete: Function;
}

export default class ScrollListBlog extends PureComponent<IProps> {
  render() {
    const {
      items = [], loading, loadMore, onDelete, canLoadmore
    } = this.props;
    return (
      <>
        <InfiniteScroll
          dataLength={items.length}
          hasMore={canLoadmore}
          loader={null}
          next={loadMore.bind(this)}
          endMessage={(
            <p style={{ textAlign: 'center' }}>
              {/* <b>Yay! No more video.</b> */}
            </p>
          )}
          scrollThreshold={0.9}
        >
          <Row>
            {items.length > 0
              && items.map((item) => (
                <Col sm={24} xl={12} lg={12} md={12} xs={24} key={item._id}>
                  <BlogCard blog={item} key={item._id} onDelete={onDelete.bind(this)} />
                </Col>
              ))}
          </Row>
          {loading && <div className="text-center"><Spin /></div>}
          {!items.length && !loading && <div className="main-container custom"><Alert className="text-center" message="No data was found" type="info" /></div>}
        </InfiniteScroll>
      </>
    );
  }
}
