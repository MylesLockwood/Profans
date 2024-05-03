import { PureComponent } from 'react';
import {
  InputNumber, Button
} from 'antd';
import { IPerformer, IUser } from '@interfaces/index';
import { TickIcon } from 'src/icons';
import './performer.less';

interface IProps {
  user: IUser;
  performer: IPerformer;
  onFinish(price: any): Function;
  submiting: boolean;
}

export class TipPerformerForm extends PureComponent<IProps> {
  state = {
    price: 10
  }

  onChangeValue(price) {
    this.setState({ price });
  }

  render() {
    const {
      onFinish, submiting = false, performer, user
    } = this.props;
    const { price } = this.state;
    return (
      <div className="confirm-subscription-form">
        <div className="profile-cover" style={{ backgroundImage: 'url(\'/.static/banner-image.jpg\')' }} />
        <div className="profile-info">
          <img
            alt="main-avt"
            src={performer?.avatar || '/no-avatar.png'}
          />
          <div className="m-user-name">
            <h4>
              {performer?.name || 'N/A'}
              &nbsp;
              {performer?.verifiedAccount && (
              <TickIcon className="theme-color" />
              )}
            </h4>
            <h5 style={{ textTransform: 'none' }}>
              @
              {performer?.username || 'n/a'}
            </h5>
          </div>
        </div>
        <div className="info-body">
          <div style={{ margin: '0 0 20px', textAlign: 'center' }}>
            <p>Enter your amount </p>
            <InputNumber min={1} onChange={this.onChangeValue.bind(this)} value={price} />
          </div>
        </div>
        {user.authorisedCard ? <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish(price)}>SEND TIP</Button>
          : (
            <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish(price)}>
              PLEASE ADD A PAYMENT CARD
            </Button>
          )}
      </div>
    );
  }
}
