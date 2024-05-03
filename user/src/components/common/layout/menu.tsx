import { PureComponent, Fragment } from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import Router from 'next/router';

interface IProps {
  theme?: string;
  isMobile?: boolean;
  menus?: any;
  collapsed?: boolean;
}

export class SiderMenu extends PureComponent<IProps> {
  state = {
    openKeys: []
  };

  componentDidMount() {
    // Router.events.on('routeChangeStart', this.routerChange.bind(this));
  }

  onOpenChange = (keys) => {
    const { menus } = this.props;
    const { openKeys } = this.state;
    const rootSubmenuKeys = menus.filter((_) => !_.menuParentId).map((_) => _.id);

    const latestOpenKey = keys.find(
      (key) => openKeys.indexOf(key) === -1
    );

    let newOpenKeys = keys;
    if (rootSubmenuKeys.indexOf(latestOpenKey) !== -1) {
      newOpenKeys = latestOpenKey ? [latestOpenKey] : [];
    }
    this.setState({
      openKeys: newOpenKeys
    });
  }

  getSelectedKeys(menus: any) {
    const pathname = process.browser ? Router.pathname : '';
    const flatTree = this.flatten(menus);
    return flatTree
      .filter((m) => pathname.includes(m.as || m.route))
      .map((m) => m.id);
  }

  generateMenus = (data) => data.map((item) => {
    if (item.children) {
      return (
        <Menu.SubMenu
          key={item.id}
          title={(
            <>
              {item.icon}
              <span>{item.name}</span>
            </>
          )}
        >
          {this.generateMenus(item.children)}
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item key={item.id}>
        {item.icon}
        <Link href={item.route} as={item.as || item.route}>
          <a>{item.name}</a>
        </Link>
      </Menu.Item>
    );
  })

  flatten(menus, flattenMenus = []) {
    menus.forEach((m) => {
      if (m.children) {
        this.flatten(m.children, flattenMenus);
      }
      const tmp = { ...m };
      delete tmp.children;
      flattenMenus.push(tmp);
    });

    return flattenMenus;
  }

  render() {
    const { theme, menus, collapsed } = this.props;
    const { openKeys } = this.state;
    // const selectedKeys = process.browser ? this.getSelectedKeys(menus) : [];
    const menuProps = collapsed
      ? {}
      : {
        openKeys
      };

    return (
      <Menu
        mode="inline"
        theme={theme as any}
        // selectedKeys={selectedKeys}
        onOpenChange={this.onOpenChange.bind(this)}
        // onClick={
        //   isMobile
        //     ? () => {
        //         onCollapseChange(true);
        //       }
        //     : undefined
        // }
        {...menuProps}
      >
        {this.generateMenus(menus)}
      </Menu>
    );
  }
}
