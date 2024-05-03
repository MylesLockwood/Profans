import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';
import Link from 'next/link';
import { StarOutlined } from '@ant-design/icons';
import { TickIcon } from 'src/icons';
import { dobToAge, shortenLargeNumber } from '@lib/index';
import './performer.less';

interface IProps {
  performer: IPerformer;
}

export default class PerformerGridCard extends PureComponent<IProps> {
  render() {
    const { performer } = this.props;
    return (
      <Link
        href={{
          pathname: '/content-creator/profile',
          query: { username: performer?.username || performer?._id }
        }}
        as={`/${performer?.username || performer?._id}`}
      >
        <a>
          <div className="grid-card" style={{ backgroundImage: `url(${performer?.avatar || '/no-avatar.png'})` }}>
            {performer?.isFreeSubscription && <span className="free-status">Free</span>}
            <span className={performer?.isOnline > 0 ? 'online-status active' : 'online-status'} />
            <div className="card-stat">
              <span>
                {shortenLargeNumber(performer?.score || 0)}
                {' '}
                <StarOutlined />
              </span>
              {performer?.dateOfBirth && (
                <span>
                  {dobToAge(performer?.dateOfBirth)}
                </span>
              )}
            </div>
            <div className="model-name">
              <span>{performer?.name || performer?.username || 'N/A'}</span>
              {performer?.verifiedAccount && <TickIcon />}
            </div>
          </div>
        </a>
      </Link>
    );
  }
}
