import { createAction, createAsyncAction } from '@lib/redux';

export const {
  getFeeds,
  getFeedsSuccess,
  getFeedsFail
} = createAsyncAction('getFeeds', 'GET_FEEDS');

export const {
  moreFeeds,
  moreFeedsSuccess,
  moreFeedsFail
} = createAsyncAction('moreFeeds', 'GET_MODE_FEEDS');

export const removeFeedSuccess = createAction('removeFeedSuccess');
