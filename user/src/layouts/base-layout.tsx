/* eslint-disable no-nested-ternary */
import { PureComponent } from 'react';
import { IUIConfig } from 'src/interfaces';
import BlankLayout from './blank-layout';
import PrimaryLayout from './primary-layout';
import MaintenaceLayout from './maintenance-layout';
import GEOLayout from './geoBlocked-layout';
import PublicLayout from './public-layout';
import StreamLayOut from './stream-layout';

interface DefaultProps {
  children: any;
  appConfig?: IUIConfig;
  layout?: string;
  maintenance?: boolean;
  geoBlocked?: boolean;
}

const LayoutMap = {
  geoBlock: GEOLayout,
  maintenance: MaintenaceLayout,
  primary: PrimaryLayout,
  public: PublicLayout,
  blank: BlankLayout,
  stream: StreamLayOut
};

export default class BaseLayout extends PureComponent<DefaultProps> {
  render() {
    const {
      children, layout, maintenance = false, geoBlocked = false
    } = this.props;
    const Container = maintenance ? LayoutMap.maintenance : geoBlocked ? LayoutMap.geoBlock : layout && LayoutMap[layout] ? LayoutMap[layout] : LayoutMap.primary;
    return (
      <>
        <Container>{children}</Container>
      </>
    );
  }
}
