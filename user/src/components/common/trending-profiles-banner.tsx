import { PureComponent } from 'react';
import { Carousel, Spin } from 'antd';
import PerformerTrendingCard from '@components/performer/trending-profile';
import { ITrendingPerformer } from '@interfaces/index';
import '@components/performer/performer.less';

interface IProps {
  items: ITrendingPerformer[];
  loading: boolean;
}

export class TrendingProfilesBanner extends PureComponent<IProps> {
  render() {
    const { items, loading } = this.props;
    return (
      <div className="trending-carousel">
        {items && items.length > 0
        && (
        <Carousel
          autoplay
          swipeToSlide
          adaptiveHeight
          effect="fade"
          swipe
          draggable
          arrows
          infinite
          dots={false}
        >
          {items.map((item) => (
            <PerformerTrendingCard key={item._id} performer={item} />
          ))}
        </Carousel>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </div>

    );
  }
}
