import { PureComponent } from 'react';
import { Avatar } from 'antd';
import { TickIcon } from 'src/icons';
import { IPerformer, IUIConfig } from 'src/interfaces';
import Link from 'next/link';
import { connect } from 'react-redux';
import moment from 'moment';
import './performer.less';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig
}

class PerformerCard extends PureComponent<IProps> {
  render() {
    const { performer, ui } = this.props;
    const { countries } = ui;
    const country = countries && countries.length && countries.find((c) => c.code === performer.country);

    return (
      <div
        className="model-card"
        style={{
          backgroundImage: `url(${performer?.cover || '/static/banner-image.jpg'})`
        }}
      >
        <div className="hovering">
          <Link
            href={{
              pathname: '/content-creator/profile',
              query: { username: performer?.username || performer?._id }
            }}
            as={`/${performer?.username || performer?._id}`}
          >
            <a>
              {performer?.isFreeSubscription && (
              <div className="card-stat">
                <span>Free</span>
              </div>
              )}
              {country && (
              <span className="card-country">
                <img alt="performer-country" src={country?.flag} />
              </span>
              )}
              <span className="card-age">
                {moment().diff(moment(performer.dateOfBirth), 'years') > 0 && `${moment().diff(moment(performer.dateOfBirth), 'years')}+`}
              </span>
              <div className="card-img">
                <Avatar alt="avatar" src={performer?.avatar || '/static/no-avatar.png'} />
              </div>
              <span className={performer?.isOnline > 0 ? 'online-status active' : 'online-status'} />
              <div className="model-name">
                <div className="name">
                  {performer?.name || 'N/A'}
                  {' '}
                  {performer?.verifiedAccount && <TickIcon />}
                </div>
                <p>
                  {`@${performer?.username || 'n/a'}`}
                </p>
              </div>
            </a>
          </Link>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(PerformerCard);
