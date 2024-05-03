import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { storyService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  getPerformerStories, getPerformerStoriesFail, getPerformerStoriesSuccess,
  moreStories, moreStoriesFail, moreStoriesSuccess
} from './actions';

const performerStorySagas = [
  {
    on: getPerformerStories,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield storyService.userSearch(data.payload);
        yield put(getPerformerStoriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getPerformerStoriesFail(error));
      }
    }
  },
  {
    on: moreStories,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield storyService.userSearch(data.payload);
        yield put(moreStoriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreStoriesFail(error));
      }
    }
  }
];

export default flatten([createSagas(performerStorySagas)]);
