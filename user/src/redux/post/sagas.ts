import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { feedService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  getFeeds, getFeedsSuccess, getFeedsFail,
  moreFeeds, moreFeedsSuccess, moreFeedsFail
} from './actions';

const performerSagas = [
  {
    on: getFeeds,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = data.payload.isHome ? yield feedService.userHomeFeeds(data.payload) : yield feedService.userSearch(data.payload);
        yield put(getFeedsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getFeedsFail(error));
      }
    }
  },
  {
    on: moreFeeds,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = data.payload.isHome ? yield feedService.userHomeFeeds(data.payload) : yield feedService.userSearch(data.payload);
        yield put(moreFeedsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreFeedsFail(error));
      }
    }
  }
];

export default flatten([createSagas(performerSagas)]);
