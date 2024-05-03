import App from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import nextCookie from 'next-cookies';
import withReduxSaga from '@redux/withReduxSaga';
import { Store } from 'redux';
import BaseLayout from '@layouts/base-layout';
import { authService, userService } from '@services/index';
import Router from 'next/router';
import { NextPageContext } from 'next';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { updateUIValue } from '@redux/ui/actions';
import { settingService } from '@services/setting.service';
import Head from 'next/head';
import '../style/index.less';

function redirectLogin(ctx: any) {
  if (process.browser) {
    authService.removeToken();
    Router.push('/auth/login');
    return;
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/auth/login' });
  ctx.res.end && ctx.res.end();
}

async function auth(ctx: NextPageContext) {
  try {
    const { store } = ctx;
    const state = store.getState();
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    // TODO - move to a service
    const { token } = nextCookie(ctx);
    if (!token) {
      // log out and redirect to login page
      // TODO - reset app state?
      redirectLogin(ctx);
      return;
    }
    authService.setAuthHeaderToken(token);
    const user = await userService.me({
      Authorization: token
    });
    // TODO - check permission
    if (user.data && !user.data.roles.includes('admin')) {
      redirectLogin(ctx);
      return;
    }
    store.dispatch(loginSuccess());
    store.dispatch(updateCurrentUser(user.data));
  } catch (e) {
    redirectLogin(ctx);
  }
}

async function updateSettingsStore(ctx: NextPageContext, settings) {
  const { store } = ctx;
  store.dispatch(
    updateUIValue({
      logo: settings.logoUrl,
      siteName: settings.siteName
    })
  );
}

interface AppComponent extends NextPageContext {
  layout: string;
}

interface IApp {
  store: Store;
  layout: string;
  authenticate: boolean;
  Component: AppComponent;
  settings: any
}

class Application extends App<IApp> {
  // TODO - consider if we need to use get static props in children component instead?
  // or check in render?
  static async getInitialProps({ Component, ctx }) {
    // won't check auth for un-authenticated page such as login, register
    // use static field in the component
    if (Component.authenticate !== false) {
      await auth(ctx);
    }
    let settings = {};
    if (!process.browser) {
      const resp = await settingService.public();
      settings = resp?.data;
      if (settings) await updateSettingsStore(ctx, settings);
    }
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return {
      settings,
      pageProps,
      layout: Component.layout
    };
  }

  render() {
    const {
      Component, pageProps, store, settings
    } = this.props;
    const { layout } = Component;
    return (
      <Provider store={store}>
        <Head>
          <link
            rel="icon"
            href={settings && settings.favicon}
            sizes="64x64"
          />
        </Head>
        <BaseLayout layout={layout}>
          <Component {...pageProps} />
        </BaseLayout>
      </Provider>
    );
  }
}

export default withReduxSaga(Application);
