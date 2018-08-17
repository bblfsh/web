import * as api from '../services/api';

export const initialState = {
  loading: false,
  error: null,
  bblfshdVersion: undefined,
  webVersion: undefined,
  loadedFrom: null,
};

export const LOAD = 'bblfsh/versions/LOAD';
export const SET = 'bblfsh/versions/SET';
export const FAILED = 'bblfsh/versions/FAILED';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
        error: null,
        loadedFrom: action.from,
      };
    case SET:
      return {
        ...state,
        loading: false,
        error: null,
        bblfshdVersion: action.bblfshdVersion,
        webVersion: action.webVersion,
      };
    case FAILED:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
};

export const load = () => (dispatch, getState) => {
  const { options: { customServer, customServerUrl } } = getState();
  const from = customServer ? customServerUrl : undefined;

  dispatch({ type: LOAD, from });

  return api
    .version(from)
    .then(resp => {
      dispatch({
        type: SET,
        webVersion: resp.web,
        bblfshdVersion: resp.server,
      });
    })
    .catch(err => {
      dispatch({ type: FAILED, error: err });
    });
};

export const updateIfNeeded = () => (dispatch, getState) => {
  const {
    options: { customServer, customServerUrl },
    versions: { loadedFrom },
  } = getState();
  const from = customServer ? customServerUrl : undefined;

  if (loadedFrom === from) {
    return;
  }

  return dispatch(load());
};
