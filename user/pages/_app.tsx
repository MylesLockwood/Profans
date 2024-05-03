/* eslint-disable react/no-danger */
import App from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import nextCookie from 'next-cookies';
import withReduxSaga from '@redux/withReduxSaga';
import { Store } from 'redux';
import BaseLayout from '@layouts/base-layout';
import {
  authService, userService, settingService, utilsService
} from '@services/index';
import Router from 'next/router';
import { NextPageContext } from 'next';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { updateUIValue } from '@redux/ui/actions';
import { updateSettings } from '@redux/settings/actions';
import { Socket } from 'src/socket';
import Head from 'next/head';
import { SETTING_KEYS } from 'src/constants';
import { pick } from 'lodash';
import { updateLiveStreamSettings } from '@redux/streaming/actions';
import '../style/index.less';

declare global {
  interface Window {
    ReactSocketIO: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

function setCookie(cname, cvalue, exTime) {
  const d = new Date();
  d.setTime(d.getTime() + (exTime * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkGeoCookie() {
  const checkGeo = getCookie('checkGeoBlock');
  if (checkGeo !== '') {
    return true;
  }
  return false;
}

declare global {
  interface Window {
    ReactSocketIO: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

function redirectLogin(ctx: any) {
  if (process.browser) {
    authService.removeToken();
    Router.push('/');
    return;
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.clearCookie && ctx.res.clearCookie('role');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/' });
  ctx.res.end && ctx.res.end();
}

async function auth(
  ctx: NextPageContext,
  noredirect: boolean,
  onlyPerformer: boolean
) {
  try {
    const { store } = ctx;
    const state = store.getState();
    const { token } = nextCookie(ctx);
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    if (token) {
      authService.setToken(token);
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data || !user.data._id) {
        redirectLogin(ctx);
        return;
      }
      if (!user.data.isPerformer && onlyPerformer && !noredirect) {
        redirectLogin(ctx);
        return;
      }
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      return;
    }

    !noredirect && redirectLogin(ctx);
  } catch (e) {
    redirectLogin(ctx);
  }
}

async function updateSettingsStore(ctx: NextPageContext, settings) {
  try {
    const { store } = ctx;
    store.dispatch(
      updateUIValue({
        logo: settings.logoUrl || '',
        siteName: settings.siteName || '',
        favicon: settings.favicon || '',
        loginPlaceholderImage: settings.loginPlaceholderImage || '',
        menus: settings.menus || [],
        footerContent: settings.footerContent || '',
        countries: settings.countries || [],
        userBenefit: settings.userBenefit || '',
        modelBenefit: settings.modelBenefit || ''
      })
    );
    store.dispatch(
      updateLiveStreamSettings(
        pick(settings, [
          SETTING_KEYS.VIEWER_URL,
          SETTING_KEYS.PUBLISHER_URL,
          SETTING_KEYS.SUBSCRIBER_URL,
          SETTING_KEYS.OPTION_FOR_BROADCAST,
          SETTING_KEYS.OPTION_FOR_PRIVATE,
          SETTING_KEYS.SECURE_OPTION,
          SETTING_KEYS.ANT_MEDIA_APPNAME
        ])
      )
    );
    store.dispatch(
      updateSettings(
        pick(settings, [
          SETTING_KEYS.GOOGLE_RECAPTCHA_SITE_KEY,
          SETTING_KEYS.ENABLE_GOOGLE_RECAPTCHA,
          SETTING_KEYS.GOOGLE_CLIENT_ID,
          SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION,
          SETTING_KEYS.REFERRAL_COMMISSION
        ])
      )
    );

    // TODO - update others like meta data
  } catch (e) {
    // TODO - implement me
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

interface AppComponent extends NextPageContext {
  layout: string;
}

interface IApp {
  store: Store;
  layout: string;
  authenticate: boolean;
  Component: AppComponent;
  settings: any;
  geoBlocked: boolean;
}

class Application extends App<IApp> {
  static settingQuery = false;

  // TODO - consider if we need to use get static props in children component instead?
  // or check in render?
  static async getInitialProps({ Component, ctx }) {
    // won't check auth for un-authenticated page such as login, register
    // use static field in the component

    const { noredirect, onlyPerformer, authenticate } = Component;
    if (authenticate !== false) {
      await auth(ctx, noredirect, onlyPerformer);
    }
    const { token } = nextCookie(ctx);
    ctx.token = token || '';
    // server side to load settings, once time only
    let settings = {};
    let geoBlocked = false;

    if (process.browser && !checkGeoCookie()) {
      const checkBlock = await userService.checkCountryBlock() as any;
      // set interval check every single hour
      setCookie('checkGeoBlock', true, 1);
      if (checkBlock && checkBlock.data && checkBlock.data.blocked) {
        geoBlocked = true;
      }
    }
    if (!process.browser) {
      const [setting, countryList] = await Promise.all([
        settingService.all('all', true),
        utilsService.countriesList()
      ]);
      settings = { ...setting.data, countries: countryList.data };
      await updateSettingsStore(ctx, settings);
    }
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return {
      geoBlocked,
      settings,
      pageProps,
      layout: Component.layout
    };
  }

  render() {
    const {
      Component, pageProps, store, settings, geoBlocked
    } = this.props;
    const { layout } = Component;
    return (
      <Provider store={store}>
        <Head>
          <title>{settings?.siteName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <Socket>
          <BaseLayout layout={layout} maintenance={settings.maintenanceMode} geoBlocked={geoBlocked}>
            <Component {...pageProps} />
          </BaseLayout>
        </Socket>
        {/* extra script */}
        {settings && settings.afterBodyScript && (
          <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
        )}
      </Provider>
    );
  }
}

export default withReduxSaga(Application);
