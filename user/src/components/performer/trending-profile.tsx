import { PureComponent } from 'react';
import { TickIcon } from 'src/icons';
import { ITrendingPerformer } from 'src/interfaces';
import Link from 'next/link';
import './performer.less';

interface IProps {
  performer: ITrendingPerformer;
}

export default class PerformerTrendingCard extends PureComponent<IProps> {
  render() {
    const {
      performer
    } = this.props;
    const { ordering } = performer;

    return (
      <div
        className="trending-card"
        style={{ backgroundImage: (performer.cover && `url('${performer.cover}')`) || "url('/static/banner-image.jpg')" }}
        key={performer._id}
      >
        <Link
          href={{
            pathname: '/content-creator/profile',
            query: { username: performer?.username || performer?._id }
          }}
          as={`/${performer?.username || performer?._id}`}
        >
          <div className="bg-2nd">
            <div className="trending-profile">
              <div className="profile-left">
                <img className="trending-avatar" alt="" src={performer?.avatar || '/static/no-avatar.png'} />
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
              <div className="profile-right">
                <div className="ordering">
                  <a>
                    {`#${(ordering || 0) + 1} trending`}
                  </a>
                </div>
                <p className="bio">{performer?.bio}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
}
