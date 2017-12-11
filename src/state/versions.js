import * as api from 'services/api';

export const initialState = {
  loading: false,
  error: null,
  bblfshdVersion: undefined,
  dashboardVersion: undefined,
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
      };
    case SET:
      return {
        ...state,
        loading: false,
        error: null,
        bblfshdVersion: action.bblfshdVersion,
        dashboardVersion: action.dashboardVersion,
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

  dispatch({ type: LOAD });

  return api
    .version(customServer ? customServerUrl : undefined)
    .then(resp => {
      dispatch({
        type: SET,
        dashboardVersion: resp.dashboard,
        bblfshdVersion: resp.server,
      });
    })
    .catch(err => {
      dispatch({ type: FAILED, error: err });
    });
};
