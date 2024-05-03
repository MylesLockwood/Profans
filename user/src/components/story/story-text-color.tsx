import { PureComponent } from 'react';
import { ChromePicker } from 'react-color';
import './index.less';

interface IProps {
  onChangeColor: Function;
}

export default class StoryColorForm extends PureComponent<IProps> {
state = {
  activeColor: '#fff'
}

async handleChange(color) {
  const { onChangeColor } = this.props;
  await this.setState({ activeColor: color.hex });
  onChangeColor(color.hex);
}

render() {
  const { activeColor } = this.state;
  return (
    <div className="colors">
      <ChromePicker color={activeColor} onChange={this.handleChange.bind(this)} />
    </div>
  );
}
}
