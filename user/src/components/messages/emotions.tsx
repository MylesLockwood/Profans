/* eslint-disable react/destructuring-assignment */
import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import './Compose.less';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface IProps {
  onEmojiClick: Function;
}

export class Emotions extends PureComponent<IProps> {
  render() {
    const { onEmojiClick } = this.props;
    return (
      <Picker
        onEmojiClick={(e, emoji) => onEmojiClick(emoji)}
        disableAutoFocus
        disableSearchBar
        disableSkinTonePicker
      />
    );
  }
}
