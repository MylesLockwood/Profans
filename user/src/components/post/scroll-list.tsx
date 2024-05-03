import { PureComponent } from 'react';
import { Alert, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IFeed } from '@interfaces/index';
import FeedCard from './post-card';
import FeedGridCard from './grid-card';

interface IProps {
  items: IFeed[];
  canLoadmore: boolean;
  loadMore: Function;
  onDelete: Function;
  loading?: boolean;
  isGrid?: boolean;
}

export default class ScrollListFeed extends PureComponent<IProps> {
  render() {
    const {
      items = [], loadMore, onDelete, canLoadmore, loading = false, isGrid = false
    } = this.props;

    return (
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore.bind(this)}
        endMessage={null}
        scrollThreshold={0.9}
      >
        <div className={isGrid ? 'grid-view' : ''}>
          {items.length > 0 && items.map((item) => {
            if (isGrid) {
              return <FeedGridCard feed={item} key={item._id} />;
            }
            return <FeedCard feed={item} key={item._id} onDelete={onDelete.bind(this)} />;
          })}
        </div>
        {!items.length && !loading && (
        <div className="main-container custom">
          <Alert className="text-center" message="No post was found" type="info" />
        </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}
