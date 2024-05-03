import { PureComponent } from 'react';
import {
  Alert, Spin, Row, Col
} from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IPerformer } from 'src/interfaces';
import PerformerCard from './grid-card';

interface IProps {
  items: IPerformer[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export class ScrollListPerformer extends PureComponent<IProps> {
  render() {
    const {
      items = [], loadMore, canLoadmore = false, loading = false
    } = this.props;
    return (
      <>
        <InfiniteScroll
          dataLength={items.length}
          hasMore={canLoadmore}
          loader={null}
          next={loadMore}
          endMessage={null}
          scrollThreshold={0.9}
        >
          <Row>
            {items.length > 0 && items.map((performer) => (
              <Col xs={12} sm={12} md={8} lg={6} key={performer._id}>
                <PerformerCard performer={performer} />
              </Col>
            ))}
          </Row>
          {!loading && !items.length && (
          <div className="main-container custom">
            <Alert className="text-center" type="info" message="No profile was found" />
          </div>
          )}
          {loading && <div className="text-center"><Spin /></div>}
        </InfiniteScroll>
      </>
    );
  }
}
