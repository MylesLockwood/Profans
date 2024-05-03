/* eslint-disable no-nested-ternary */
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import Router from 'next/router';
import { authService, userService } from 'src/services';
import {
  ILogin, IFanRegister, IForgot, IPerformerRegister
} from 'src/interfaces';
import { message } from 'antd';
import * as _ from 'lodash';
import { updateCurrentUser } from '../user/actions';
import {
  loginSocial,
  login,
  loginSuccess,
  logout,
  loginFail,
  registerFanFail,
  registerFan,
  registerFanSuccess,
  registerPerformerFail,
  registerPerformer,
  registerPerformerSuccess,
  forgot,
  forgotSuccess,
  forgotFail
} from './actions';

const authSagas = [
  {
    on: login,
    * worker(data: any) {
      try {
        const { payload } = data;
        const resp = (yield authService.login(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token, payload?.remember);
        const userResp = yield userService.me();
        yield put(updateCurrentUser(userResp.data));
        yield put(loginSuccess());
        if (!userResp?.data?.isPerformer) {
          Router.push((!userResp.data.email || !userResp.data.username) ? '/user/account' : '/home');
        }
        if (userResp?.data?.isPerformer) {
          (!userResp.data.email || !userResp.data.username) ? Router.push('/content-creator/account') : Router.push({ pathname: '/content-creator/profile', query: { username: userResp.data.username || userResp.data._id } }, `/${userResp.data.username || userResp.data._id}`);
        }
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: loginSocial,
    * worker(data: any) {
      try {
        const payload = data.payload as any;
        const { token } = payload;
        yield authService.setToken(token);
        const userResp = yield userService.me();
        yield put(updateCurrentUser(userResp.data));
        yield put(loginSuccess());
        if (!userResp?.data?.isPerformer) {
          Router.push((!userResp.data.email || !userResp.data.username) ? '/user/account' : '/home');
        }
        if (userResp?.data?.isPerformer) {
          (!userResp.data.email || !userResp.data.username) ? Router.push('/content-creator/account') : Router.push({ pathname: '/content-creator/profile', query: { username: userResp.data.username || userResp.data._id } }, `/${userResp.data.username || userResp.data._id}`);
        }
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: registerFan,
    * worker(data: any) {
      try {
        const payload = data.payload as IFanRegister;
        const resp = (yield authService.register(payload)).data;
        Router.push('/');
        yield put(registerFanSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'This Username or email address has been already taken.');
        yield put(registerFanFail(error));
      }
    }
  },
  {
    on: registerPerformer,
    * worker(data: any) {
      try {
        const verificationFiles = [{
          fieldname: 'idVerification',
          file: data.payload.idVerificationFile
        }, {
          fieldname: 'documentVerification',
          file: data.payload.documentVerificationFile
        }];
        const payload = _.pick(data.payload, ['name', 'username', 'password',
          'gender', 'email', 'firstName', 'lastName', 'country', 'dateOfBirth']) as IPerformerRegister;
        const resp = (yield authService.registerPerformer(verificationFiles, payload, () => {})).data;
        Router.push('/');
        yield put(registerPerformerSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'This Username or email ID has been already taken.');
        yield put(registerPerformerFail(error));
      }
    }
  },
  {
    on: logout,
    * worker() {
      try {
        yield authService.removeToken();
        Router.replace('/');
      } catch (e) {
        message.error('Something went wrong.');
      }
    }
  },
  {
    on: forgot,
    * worker(data: any) {
      try {
        const payload = data.payload as IForgot;
        const resp = (yield authService.resetPassword(payload)).data;
        message.success(
          'We\'ve sent an email to reset your password, please check your inbox.',
          10
        );
        yield put(forgotSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error((error && error.message) || 'Something went wrong. Please try again later', 5);
        yield put(forgotFail(error));
      }
    }
  }
];

export default flatten([createSagas(authSagas)]);
