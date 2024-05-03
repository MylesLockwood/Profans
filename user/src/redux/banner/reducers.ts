import { createReducers } from '@lib/redux';
import { merge } from 'lodash';
import { getBanners, getBannersSuccess, getBannersFail } from './actions';

const initialState = {
  listBanners: {
    loading: false,
    items: [],
    total: 0,
    error: null,
    success: false
  }
};

const bannerReducer = [
  {
    on: getBanners,
    reducer(state: any) {
      return {
        ...state,
        listBanners: {
          loading: true
        }
      };
    }
  },
  {
    on: getBannersSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        listBanners: {
          loading: false,
          items: data.payload.data,
          total: data.payload.total,
          error: null,
          success: true
        }
      };
    }
  },
  {
    on: getBannersFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        listBanners: {
          loading: false,
          items: [],
          total: 0,
          error: data.payload,
          success: false
        }
      };
    }
  }
];

export default merge(
  {},
  createReducers('banner', [bannerReducer], initialState)
);
