import { PureComponent } from 'react';
import {
  message, Button, Input, Row, Col
} from 'antd';
import { TickIcon } from 'src/icons';
import { IFeed, IUser } from '@interfaces/index';
import { paymentService } from '@services/index';
import './index.less';

interface IProps {
  user?: IUser;
  feed: IFeed;
  onFinish(price: any): Function;
  submiting: boolean;
}

export class PurchaseFeedForm extends PureComponent<IProps> {
  state = {
    couponCode: '',
    coupon: null,
    isApliedCode: false
  }

  onChangeValue(e) {
    this.setState({ couponCode: e.target.value });
  }

  async applyCoupon() {
    const { couponCode } = this.state;
    if (!couponCode) return;
    try {
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({ coupon: resp.data, isApliedCode: true });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : 'Error occured, please try again later'
      );
    }
  }

  render() {
    const {
      onFinish, submiting = false, feed, user
    } = this.props;
    const { coupon, isApliedCode, couponCode } = this.state;
    const price = !coupon ? feed.price : (feed.price - feed.price * coupon.value).toFixed(2);
    return (
      <div className="confirm-subscription-form">
        <div className="profile-cover" style={{ backgroundImage: 'url(\'/static/banner-image.jpg\')' }} />
        <div className="profile-info">
          <img
            alt="main-avt"
            src={feed?.performer?.avatar || '/static/no-avatar.png'}
          />
          <div className="m-user-name">
            <h4>
              {feed?.performer?.name || 'N/A'}
                 &nbsp;
              {feed?.performer?.verifiedAccount && (
              <TickIcon className="theme-color" />
              )}
            </h4>
            <h5 style={{ textTransform: 'none' }}>
              @
              {feed?.performer?.username || 'n/a'}
            </h5>
          </div>
        </div>
        <div className="info-body">
          <p style={{ fontSize: 12 }}>{feed?.text}</p>
          {user?.authorisedCard && (
          <Row>
            <Col span={18}>
              <Input disabled={isApliedCode} placeholder="Enter coupon code here" onChange={this.onChangeValue.bind(this)} />
            </Col>
            <Col span={6}>
              {!isApliedCode ? <Button onClick={this.applyCoupon.bind(this)}>Apply Code!</Button>
                : <Button onClick={() => this.setState({ isApliedCode: false, couponCode: '', coupon: null })}>Use Coupon Later!</Button>}
            </Col>
          </Row>
          )}
        </div>
        {user?.authorisedCard ? (
          <Button type="primary" loading={submiting} onClick={() => onFinish(couponCode)}>
            UNLOCK THIS POST BY $
            {price}
          </Button>
        )
          : (
            <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish(couponCode)}>
              PLEASE ADD A PAYMENT CARD
            </Button>
          )}
      </div>
    );
  }
}
