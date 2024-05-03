import { PureComponent } from 'react';
import { IProductUpdate } from 'src/interfaces';

interface IProps {
  product?: IProductUpdate;
  style?: Record<string, string>;
}

export class ImageProduct extends PureComponent<IProps> {
  render() {
    const { product, style } = this.props;
    const { image } = product;
    const url = image || '/product.png';
    return <img src={url} style={style || { width: 130 }} alt="url" />;
  }
}
