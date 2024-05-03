import InfiniteScroll from 'react-infinite-scroll-component';
import { IPerformer } from 'src/interfaces';
import PerformerCard from '@components/performer/card';
import {
  Row, Col, Alert, Spin
} from 'antd';

interface IProps {
  performers: IPerformer[];
  total: number;
  loadMore(): Function;
  loading: boolean;
}

const UserPerformerBookmarks = ({
  loadMore, performers, total, loading
}: IProps) => (
  <>
    <InfiniteScroll
      dataLength={performers.length}
      hasMore={performers && performers.length < total}
      loader={null}
      next={loadMore}
      endMessage={null}
      scrollThreshold={0.9}
    >
      <Row>
        {performers.length > 0
          && performers.map((p: any) => (
            <Col xs={12} sm={12} md={8} lg={8} key={p._id}>
              <PerformerCard performer={p} />
            </Col>
          ))}
      </Row>
    </InfiniteScroll>
    {!performers.length && !loading && <Alert type="info" message="No content creator found" />}
    {loading && (
    <div className="text-center">
      <Spin />
    </div>
    )}
  </>
);

export default UserPerformerBookmarks;
