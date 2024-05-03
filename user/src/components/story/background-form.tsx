/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { PureComponent } from 'react';
import { Col, Row } from 'antd';
import './index.less';

const urls = [];
for (let i = 1; i < 13; i += 1) {
  urls.push(`/static/story-img/${i}.jpg`);
}

interface IProps {
  onChangeUrl: Function;
}
export default class StoryBackgroundForm extends PureComponent<IProps> {
state = {
  activeUrl: urls[0]
}

render() {
  const { onChangeUrl } = this.props;
  const { activeUrl } = this.state;
  return (
    <div className="story-backgrounds">
      <Row>
        {urls.length > 0 && urls.map((url) => (
          <Col md={4} xs={8} key={url} onClick={() => { onChangeUrl(url); this.setState({ activeUrl: url }); }}>
            <img src={url} alt="img" width="100%" className={activeUrl === url ? 'active' : ''} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
}
