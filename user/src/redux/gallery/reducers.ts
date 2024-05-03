import { createReducers } from '@lib/redux';
import { merge } from 'lodash';
import {
  getGalleries,
  getGalleriesSuccess,
  getGalleriesFail, moreGalleries, moreGalleriesFail, moreGalleriesSuccess
} from './actions';

const initialState = {
  listGalleries: {
    requesting: false,
    items: [],
    total: 0,
    error: null,
    success: false
  }
};

const galleryReducer = [
  {
    on: getGalleries,
    reducer(state: any) {
      return {
        ...state,
        listGalleries: {
          ...state.listGalleries,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: getGalleriesSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        listGalleries: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          error: null,
          success: true
        }
      };
    }
  },
  {
    on: getGalleriesFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        listGalleries: {
          items: { ...state.listGalleries.items },
          total: { ...state.listGalleries.total },
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: moreGalleries,
    reducer(state: any) {
      return {
        ...state,
        listGalleries: {
          ...state.listGalleries,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreGalleriesSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        listGalleries: {
          requesting: false,
          total: data.payload.total,
          items: [...state.listGalleries.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreGalleriesFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        listGalleries: {
          ...state.listGalleries,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  }
];

export default merge({}, createReducers('gallery', [galleryReducer], initialState));
