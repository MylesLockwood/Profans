/* eslint-disable no-nested-ternary */
import { PureComponent } from 'react';
import {
  Button
} from 'antd';
import { IPerformer, IUser } from 'src/interfaces';
import {
  CheckSquareOutlined
} from '@ant-design/icons';
import { TickIcon } from 'src/icons';
import './performer.less';

interface IProps {
  user: IUser;
  type: string;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export class ConfirmSubscriptionPerformerForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, submiting = false, performer, type, user
    } = this.props;
    return (
      <div className="confirm-subscription-form">
        <div className="profile-cover" style={{ backgroundImage: 'url(\'/static/banner-image.jpg\')' }} />
        <div className="profile-info">
          <img
            alt="main-avt"
            src={performer?.avatar || '/static/no-avatar.png'}
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
          <p>
            SUBSCRIBE & GET THIS BENEFITS
          </p>
          <ul>
            <li>
              <CheckSquareOutlined />
              {' '}
              Full access to this creator&apos;s content
            </li>
            <li>
              <CheckSquareOutlined />
              {' '}
              Direct message with this creator
            </li>
            <li>
              <CheckSquareOutlined />
              {' '}
              Cancel your subscription at any time
            </li>
          </ul>
        </div>
        {(user.authorisedCard && type !== 'free') || (!user.authorisedCard && type === 'free') ? (
          <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish()}>
            Confirm
            {' '}
            {type}
            {' '}
            subscription
            {' '}
            {type !== 'free' ? (
              <>
                by $
                {' '}
                {type === 'monthly' ? performer.monthlyPrice.toFixed(2) : type === 'monthly' ? performer.yearlyPrice.toFixed(2) : ''}
              </>
            ) : null}
          </Button>
        ) : (
          <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish()}>
            PLEASE ADD A PAYMENT CARD
          </Button>
        )}
      </div>
    );
  }
}
