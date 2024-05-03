import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  getFeeds, getFeedsSuccess, getFeedsFail,
  moreFeeds, moreFeedsFail, moreFeedsSuccess,
  removeFeedSuccess
} from './actions';

const initialState = {
  feeds: {
    requesting: false,
    error: null,
    data: null,
    success: false
  }
};

const feedReducers = [
  {
    on: getFeeds,
    reducer(state: any) {
      return {
        ...state,
        feeds: {
          ...state.feeds,
          requesting: true
        }
      };
    }
  },
  {
    on: getFeedsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        feeds: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getFeedsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        feeds: {
          ...state.feeds,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreFeeds,
    reducer(state: any) {
      return {
        ...state,
        feeds: {
          ...state.feeds,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreFeedsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        feeds: {
          requesting: false,
          total: data.payload.total,
          items: [...state.feeds.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreFeedsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        feeds: {
          ...state.feeds,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: removeFeedSuccess,
    reducer(prevState: any, data: any) {
      const { feed } = data.payload;
      const { items } = prevState.feeds || [];
      items.splice(items.findIndex((f) => f._id === feed._id), 1);
      return {
        ...prevState,
        feeds: {
          total: prevState.total - 1,
          items
        }
      };
    }
  }
];

export default merge({}, createReducers('feed', [feedReducers], initialState));
