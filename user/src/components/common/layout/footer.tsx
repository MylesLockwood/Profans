import { PureComponent } from 'react';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IUser, IUIConfig } from 'src/interfaces';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
}
class Footer extends PureComponent<IProps> {
  render() {
    const linkAuth = (
      <>
        <li>
          <Link href="/">
            <a>Login</a>
          </Link>
        </li>
        <li>
          <Link href="/auth/register">
            <a>Sign up</a>
          </Link>
        </li>
      </>
    );
    const { ui, currentUser } = this.props;
    const menus = ui.menus && ui.menus.length > 0
      ? ui.menus.filter((m) => m.section === 'footer')
      : [];
    return (

      <div className="main-footer">
        <div className="main-container">
          <ul>
            <li>
              <Link href="/home">
                <a>Home</a>
              </Link>
            </li>
            <li>
              <Link href="/content-creator">
                <a>Creators</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a>Contact us</a>
              </Link>
            </li>
            {!currentUser._id ? linkAuth : null}
          </ul>
          {menus && menus.length > 0
            && (
              <ul>
                {menus.map((item) => (
                  <li key={item._id}>
                    <a rel="noreferrer" href={item.path} target={item.isNewTab ? '_blank' : ''}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          {/* eslint-disable-next-line react/no-danger */}
          {ui.footerContent ? <div className="footer-content" dangerouslySetInnerHTML={{ __html: ui.footerContent }} />
            : (
              <div className="copyright-text">
                <span>
                  <Link href="/home">
                    <a>{ui?.siteName}</a>
                  </Link>
                  {' '}
                  © Copyright
                  {' '}
                  {new Date().getFullYear()}
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: { ...state.ui }
});
export default connect(mapState)(Footer) as any;
