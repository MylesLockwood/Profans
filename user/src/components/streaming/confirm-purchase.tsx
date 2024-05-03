import { PureComponent } from 'react';
import {
  message, Button, Input, Row, Col
} from 'antd';
import { } from '@ant-design/icons';
import { IPerformer } from '@interfaces/index';
import { paymentService } from '@services/index';
import '../post/index.less';

interface IProps {
  price: number;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export class PurchaseStreamForm extends PureComponent<IProps> {
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
      onFinish, submiting = false, price, performer
    } = this.props;
    const { coupon, isApliedCode, couponCode } = this.state;
    const endPrice = !coupon ? price : (price - price * coupon.value).toFixed(2);
    return (
      <div className="text-center">
        <div className="tip-performer">
          <img alt="p-avt" src={(performer?.avatar) || '/static/no-avatar.png'} style={{ width: '100px', borderRadius: '50%' }} />
          <div>
            {performer?.name || 'N/A'}
            <small>
              @
              {performer?.username || 'n/a'}
            </small>
          </div>
        </div>
        <div style={{ margin: '20px 0' }}>
          <Row>
            <Col span={18}>
              <Input disabled={isApliedCode} placeholder="Enter coupon code here" onChange={this.onChangeValue.bind(this)} />
            </Col>
            <Col span={6}>
              {!isApliedCode ? <Button onClick={this.applyCoupon.bind(this)}>Apply Code!</Button>
                : <Button onClick={() => this.setState({ isApliedCode: false, couponCode: '', coupon: null })}>Use Code Later!</Button>}
            </Col>
          </Row>

        </div>
        <Button type="primary" loading={submiting} onClick={() => onFinish(couponCode)}>
          Confirm to join this session by $
          {endPrice}
        </Button>
      </div>
    );
  }
}
