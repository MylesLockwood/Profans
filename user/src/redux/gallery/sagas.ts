import { feedService } from 'src/services';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { IReduxAction } from 'src/interfaces';
import {
  getGalleries,
  getGalleriesSuccess,
  getGalleriesFail,
  moreGalleries,
  moreGalleriesFail,
  moreGalleriesSuccess
} from './actions';

const gallerySagas = [
  {
    on: getGalleries,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield feedService.userSearch({ ...data.payload, type: 'photo' });
        yield put(getGalleriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getGalleriesFail(error));
      }
    }
  },
  {
    on: moreGalleries,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield feedService.userSearch({ ...data.payload, type: 'photo' });
        yield put(moreGalleriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreGalleriesFail(error));
      }
    }
  }
];

export default flatten([createSagas(gallerySagas)]);
