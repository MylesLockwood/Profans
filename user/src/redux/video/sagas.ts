import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { feedService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  getVideos, getVideosFail, getVideosSuccess,
  moreVideo, moreVideoFail, moreVideoSuccess
} from './actions';

const videoSagas = [
  {
    on: getVideos,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield feedService.userSearch({ ...data.payload, type: 'video' });
        yield put(getVideosSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getVideosFail(error));
      }
    }
  },
  {
    on: moreVideo,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield feedService.userSearch({ ...data.payload, type: 'video' });
        yield put(moreVideoSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreVideoFail(error));
      }
    }
  }
];

export default flatten([createSagas(videoSagas)]);
