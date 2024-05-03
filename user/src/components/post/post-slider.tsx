import { PureComponent } from 'react';
import {
  Carousel, Spin, Image
} from 'antd';
import {
  FileImageOutlined
} from '@ant-design/icons';
import { VideoPlayer } from '@components/common/video-player';
import { AudioPlayer } from '@components/common/audio-player';
import { IFeed } from '@interfaces/feed';
import Lightbox from 'react-image-lightbox';
import './index.less';

interface IProps {
  feed: IFeed;
}

export default class FeedSlider extends PureComponent<IProps> {
  state = {
    isOpenLightBox: false,
    photoIndex: 0
  }

  render() {
    const { isOpenLightBox, photoIndex } = this.state;
    const { feed } = this.props;
    const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
    const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
    const audios = feed.files && feed.files.filter((f) => f.type === 'feed-audio');
    let processing = false;
    videos && videos.forEach((f) => {
      if (f.status !== 'finished') {
        processing = true;
      }
    });
    audios && audios.forEach((f) => {
      if (f.status !== 'finished') {
        processing = true;
      }
    });
    const imagesLightBox = images && images.map((i) => i?.url);

    return (
      <div className={feed.type === 'audio' ? 'feed-slider custom' : 'feed-slider'}>
        {!processing && feed.files && feed.files.length && (
          <>
            {images && images.length > 0 && (
            <Carousel
              adaptiveHeight
              effect="fade"
              swipe
              arrows
              dots={false}
              infinite
            >
              {images.map((img, index) => (
                <Image
                  preview={false}
                  key={img._id}
                  src={img.url}
                  fallback="/static/no-image.jpg"
                  title={img.name}
                  width="100%"
                  alt="img"
                  onClick={() => this.setState({
                    isOpenLightBox: true,
                    photoIndex: index
                  })}
                />
              ))}
            </Carousel>
            )}
            {videos
              && videos.length > 0
              && videos.map((vid) => (
                <VideoPlayer
                  key={vid._id}
                  {...{
                    autoplay: false,
                    controls: true,
                    playsinline: true,
                    poster: (vid.thumbnails && vid.thumbnails[0]) || feed.thumbnailUrl,
                    fluid: true,
                    sources: [
                      {
                        src: vid.url,
                        type: 'video/mp4'
                      }
                    ]
                  }}
                />
              ))}
            {audios
              && audios.length > 0
              && audios.map((audio) => (
                <AudioPlayer key={audio._id} source={audio?.url} />
              ))}
          </>
        )}
        {processing && (
          <div className="proccessing">
            <Spin />
            <p>Your media is currently proccessing</p>
          </div>
        )}
        {images && images.length > 0 && (
        <div className="count-media">
          <span className="count-media-item">
            <span>
              {images.length}
              {' '}
              <FileImageOutlined />
              {' '}
            </span>
          </span>
        </div>
        )}
        {isOpenLightBox && (
          <Lightbox
            clickOutsideToClose={false}
            imagePadding={0}
            animationOnKeyInput
            animationDuration={600}
            mainSrc={imagesLightBox[photoIndex]}
            nextSrc={imagesLightBox[(photoIndex + 1) % images.length]}
            prevSrc={imagesLightBox[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => this.setState({ isOpenLightBox: false })}
            onMovePrevRequest={() => this.setState({
              photoIndex: (photoIndex + images.length - 1) % images.length
            })}
            onMoveNextRequest={() => this.setState({
              photoIndex: (photoIndex + 1) % images.length
            })}
          />
        )}
      </div>
    );
  }
}
