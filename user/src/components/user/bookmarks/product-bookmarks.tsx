import InfiniteScroll from 'react-infinite-scroll-component';
import { IProduct } from 'src/interfaces/index';
import { ProductCard } from '@components/product/product-card';
import {
  Row, Col, Alert, Spin
} from 'antd';

interface IProps {
  products: IProduct[];
  total: number;
  loadMore(): Function;
  loading: boolean;
}

const UserProductBookmarks = ({
  loadMore, products, total, loading
}: IProps) => (
  <>
    <InfiniteScroll
      dataLength={products.length}
      hasMore={products && products.length < total}
      loader={null}
      next={loadMore}
      endMessage={null}
      scrollThreshold={0.9}
    >
      <Row>
        {products.length > 0
          && products.map((product: IProduct) => (
            <Col xs={12} sm={12} md={6} lg={6} key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
      </Row>
    </InfiniteScroll>
    {!products.length && !loading && <Alert type="info" message="No product found" />}
    {loading && (
    <div className="text-center">
      <Spin />
    </div>
    )}
  </>
);

export default UserProductBookmarks;
