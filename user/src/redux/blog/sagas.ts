import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { blogService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  getBlogs, getBlogsSuccess, getBlogsFail,
  moreBlogs, moreBlogsSuccess, moreBlogsFail
} from './actions';

const performerSagas = [
  {
    on: getBlogs,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield blogService.userSearch(data.payload);
        yield put(getBlogsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getBlogsFail(error));
      }
    }
  },
  {
    on: moreBlogs,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield blogService.userSearch(data.payload);
        yield put(moreBlogsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreBlogsFail(error));
      }
    }
  }
];

export default flatten([createSagas(performerSagas)]);
