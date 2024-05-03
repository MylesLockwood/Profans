import { PureComponent } from 'react';
import { Alert, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IStory } from '@interfaces/index';
import StoryCard from './story-card';

interface IProps {
  items: IStory[];
  loading: boolean;
  canLoadmore: boolean;
  loadMore: Function;
  onDelete: Function;
}

export default class ScrollListStory extends PureComponent<IProps> {
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
          {items.length > 0 && items.map((item) => <StoryCard story={item} key={item._id} onDelete={onDelete.bind(this)} />)}
          {!items.length && !loading && <Alert className="text-center" message="No story was found" type="info" />}
          {loading && <div className="text-center"><Spin /></div>}
        </InfiniteScroll>
      </>
    );
  }
}
