import * as history from 'services/history';
import * as api from 'services/api';
import { indexDrivers } from 'drivers';
import { add as errorsAdd } from './errors';

const initialState = {
  loading: true,
  languages: {
    '': { name: '(auto)' },
  },
  actual: '',
  selected: '',
};

export const LOADING = 'bblfsh/languages/LOADING';
export const LOADED = 'bblfsh/languages/LOADED';
export const SET = 'bblfsh/languages/SET';
export const SELECT = 'bblfsh/languages/SELECT';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loading: true,
      };
    case LOADED:
      return {
        ...state,
        loading: false,
        languages: {
          '': { name: '(auto)' },
          ...action.languages,
        },
      };
    case SET:
      return {
        ...state,
        actual: action.actual,
      };
    case SELECT:
      return {
        ...state,
        actual: action.selected,
        selected: action.selected,
      };
    default:
      return state;
  }
};

export const load = () => dispatch => {
  dispatch({ type: LOADING });

  return api
    .listDrivers()
    .then(indexDrivers)
    .then(languages =>
      dispatch({
        type: LOADED,
        languages,
      })
    )
    .catch(err => {
      console.error(err);
      dispatch(errorsAdd(['Unable to load the list of available drivers.']));
    });
};

export const set = actual => {
  return {
    type: SET,
    actual,
  };
};

export const select = lang => (dispatch, getState) => {
  const { languages } = getState();
  if (!languages.languages.hasOwnProperty(lang)) {
    lang = '';
  }
  // side effect: set language in url
  history.setLanguage(lang);
  return dispatch({
    type: SELECT,
    selected: lang,
  });
};

export const getLanguageMode = state => {
  const { selected, actual, languages } = state.languages;
  const curLang = selected || actual;

  if (languages[curLang]) {
    return languages[curLang].mode;
  }

  return '';
};
