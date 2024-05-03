import { createAction, createAsyncAction } from '@lib/redux';

export const {
  getPerformerStories,
  getPerformerStoriesSuccess,
  getPerformerStoriesFail
} = createAsyncAction('getPerformerStories', 'GET_STORIES');

export const {
  moreStories,
  moreStoriesSuccess,
  moreStoriesFail
} = createAsyncAction('moreStories', 'GET_MODE_STORIES');

export const removeStorySuccess = createAction('removeStorySuccess');

export const addStorySuccess = createAction('addStorySuccess');
