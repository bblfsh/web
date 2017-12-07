import * as history from 'services/history';
import * as api from 'services/api';
import { set as codeSet } from './code';
import { reset as examplesReset } from './examples';
import { add as errorsAdd } from './errors';

const initialState = {
  url: '',
  gist: '',
  isValid: false,
};

export const SET_URL = 'bblfsh/gist/SET_URL';
export const SET = 'bblfsh/gist/SET';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_URL:
      const parts = action.url.match(gistRegexp);
      const gist = parts === null ? '' : parts[1];

      return {
        ...reducer(state, {
          type: SET,
          gist,
        }),
        url: action.url,
      };
    case SET:
      return {
        ...state,
        url: `https://gist.githubusercontent.com/${action.gist}`,
        gist: action.gist,
        isValid: !!action.gist,
      };
    default:
      return state;
  }
};

const gistRegexp = new RegExp(
  '^\\s*(?:https?://)?gist.githubusercontent.com/(\\S+\\s*$)'
);

export const setURL = url => {
  return {
    type: SET_URL,
    url,
  };
};

export const set = gist => {
  return {
    type: SET,
    gist,
  };
};

export const load = () => (dispatch, getState) => {
  const { gist, isValid } = getState().gist;
  if (!isValid) {
    return Promise.reject();
  }

  const gistParts = gist.split('/');
  const filename = gistParts[gistParts.length - 1];

  dispatch(examplesReset());
  // cleanup code
  dispatch(codeSet('', null));

  return api
    .getGist(gist)
    .then(content => {
      dispatch(codeSet(filename, content));
      // url side effect
      history.setGist(gist);
    })
    .catch(errors => {
      dispatch(errorsAdd(errors));
      return Promise.reject();
    });
};
