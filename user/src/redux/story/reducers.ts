import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  getPerformerStories, getPerformerStoriesFail, getPerformerStoriesSuccess,
  moreStories, moreStoriesFail, moreStoriesSuccess, removeStorySuccess, addStorySuccess
} from './actions';

const initialState = {
  stories: {
    requesting: false,
    error: null,
    data: null,
    success: false
  }
};

const storyReducers = [
  {
    on: getPerformerStories,
    reducer(state: any) {
      return {
        ...state,
        stories: {
          ...state.stories,
          requesting: true
        }
      };
    }
  },
  {
    on: getPerformerStoriesSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        stories: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getPerformerStoriesFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        stories: {
          ...state.stories,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreStories,
    reducer(state: any) {
      return {
        ...state,
        stories: {
          ...state.stories,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreStoriesSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        stories: {
          requesting: false,
          total: data.payload.total,
          items: [...state.stories.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreStoriesFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        stories: {
          ...state.stories,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: removeStorySuccess,
    reducer(prevState: any, data: any) {
      const { story } = data.payload;
      const { items } = prevState.stories || [];
      items.splice(items.findIndex((f) => f._id === story._id), 1);
      return {
        ...prevState,
        stories: {
          total: prevState.total - 1,
          items
        }
      };
    }
  },
  {
    on: addStorySuccess,
    reducer(prevState: any, data: any) {
      const { story } = data.payload;
      const items = prevState?.stories?.items || [];
      items.unshift(story);
      return {
        ...prevState,
        stories: {
          total: prevState.total + 1,
          items
        }
      };
    }
  }
];

export default merge({}, createReducers('story', [storyReducers], initialState));
