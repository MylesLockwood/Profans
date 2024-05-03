import { createAction, createAsyncAction } from '@lib/redux';

export const {
  getBlogs,
  getBlogsSuccess,
  getBlogsFail
} = createAsyncAction('getBlogs', 'GET_BLOGS');

export const {
  moreBlogs,
  moreBlogsSuccess,
  moreBlogsFail
} = createAsyncAction('moreBlogs', 'GET_MODE_BLOGS');

export const removeBlogSuccess = createAction('removeBlogSuccess');
