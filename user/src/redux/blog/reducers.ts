import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  getBlogs, getBlogsSuccess, getBlogsFail,
  moreBlogs, moreBlogsFail, moreBlogsSuccess,
  removeBlogSuccess
} from './actions';

const initialState = {
  blogs: {
    requesting: false,
    error: null,
    data: null,
    success: false
  }
};

const blogReducers = [
  {
    on: getBlogs,
    reducer(state: any) {
      return {
        ...state,
        blogs: {
          ...state.blogs,
          requesting: true
        }
      };
    }
  },
  {
    on: getBlogsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        blogs: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getBlogsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        blogs: {
          ...state.blogs,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreBlogs,
    reducer(state: any) {
      return {
        ...state,
        blogs: {
          ...state.blogs,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreBlogsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        blogs: {
          requesting: false,
          total: data.payload.total,
          items: [...state.blogs.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreBlogsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        blogs: {
          ...state.blogs,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: removeBlogSuccess,
    reducer(prevState: any, data: any) {
      const { blog } = data.payload;
      const { items } = prevState.blogs || [];
      items.splice(items.findIndex((f) => f._id === blog._id), 1);
      return {
        ...prevState,
        blogs: {
          total: prevState.total - 1,
          items
        }
      };
    }
  }
];

export default merge({}, createReducers('blog', [blogReducers], initialState));
