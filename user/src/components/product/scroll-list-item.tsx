import { PureComponent } from 'react';
import { Alert, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IProduct } from '../../interfaces';
import { PerformerListProduct } from './performer-list-product';

interface IProps {
  items: IProduct[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export class ScrollListProduct extends PureComponent<IProps> {
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
          <PerformerListProduct products={items} />
          {!loading && !items.length && (
          <div className="main-container custom">
            <Alert className="text-center" type="info" message="No product was found" />
          </div>
          )}
          {loading && <div className="text-center"><Spin /></div>}
        </InfiniteScroll>
      </>
    );
  }
}
