import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';
import './product.less';
import Link from 'next/link';

interface IProps {
  product: IProduct;
}
interface IStates {
  isBookMarked: boolean;
  requesting: boolean;
}

export class ProductCard extends PureComponent<IProps, IStates> {
  render() {
    const { product } = this.props;
    const image = product.image ? product.image : '/static/placeholder-image.jpg';
    return (
      <div className="prd-card">
        <div className="label-wrapper">
          {product.price && (
            <span className="label-wrapper-price">
              $
              {product.price.toFixed(2)}
            </span>
          )}
          {!product.stock && product.type === 'physical' && (
            <div className="label-wrapper-digital">Out of stock!</div>
          )}
          {product.type === 'digital' && (
            <span className="label-wrapper-digital">Digital</span>
          )}
        </div>
        <div className="prd-thumb">
          <Link
            href={{ pathname: '/store', query: { id: product._id } }}
            as={`/store/${product._id}`}
          >
            <span>
              <img alt="img" src={image} />
            </span>
          </Link>
        </div>
        <div className="prd-info">
          <Link
            href={{ pathname: '/store', query: { id: product._id } }}
            as={`/store/${product._id}`}
          >
            <span>{product.name}</span>
          </Link>
        </div>
      </div>
    );
  }
}
