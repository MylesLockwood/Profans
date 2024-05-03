import { PureComponent } from 'react';
import { } from '@ant-design/icons';
import './index.less';

interface IProps {
  redirectUrl: string;
}

export class PaymentIframeForm extends PureComponent<IProps> {
  render() {
    const { redirectUrl } = this.props;
    return (
      <div className="payment-iframe-form">
        <p style={{ color: 'red' }}>Please waiting for payment success!</p>
        <iframe title="Payment check out" src={redirectUrl} />
      </div>
    );
  }
}
