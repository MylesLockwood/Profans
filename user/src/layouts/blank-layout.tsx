import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import { Layout, BackTop } from 'antd';
import { connect } from 'react-redux';
import { Router } from 'next/router';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue } from '@redux/ui/actions';
import './primary-layout.less';

const Footer = dynamic(() => import('@components/common/layout/footer'));
const Loader = dynamic(() => import('@components/common/base/loader'));

interface DefaultProps {
  children: any;
  ui: IUIConfig;
}

class BlankLayout extends PureComponent<DefaultProps> {
  state = {
    routerChange: false
  };

  componentDidMount() {
    process.browser && this.handleStateChange();
  }

  handleStateChange() {
    Router.events.on(
      'routeChangeStart',
      async () => this.setState({ routerChange: true })
    );
    Router.events.on(
      'routeChangeComplete',
      async () => this.setState({ routerChange: false })
    );
  }

  render() {
    const {
      children, ui
    } = this.props;
    const { routerChange } = this.state;
    return (
      <Layout>
        <div className={ui?.theme === 'dark' ? 'container dark' : 'container'} id="primaryLayout">
          <Layout className="content" style={{ position: 'relative' }}>
            {routerChange && <Loader />}
            {children}
            <BackTop className="backTop" />
            <Footer />
          </Layout>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});

const mapDispatchToProps = { loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(BlankLayout);
