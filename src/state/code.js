import * as api from '../services/api';
import { set as languageSet } from './languages';
import { setUastQuery } from './options';
import { add as errorsAdd, clear as errorsClear } from './errors';
import { updateIfNeeded as versionUpdateIfNeeded } from './versions';
import { updateIfNeeded as driversUpdateIfNeeded } from './languages';

export const initialState = {
  filename: undefined,
  code: null,
  uastJson: null,

  dirty: false,
  parsing: false,
};

export const SET = 'bblfsh/code/SET';
export const PARSE = 'bblfsh/code/PARSE';
export const PARSE_FAILED = 'bblfsh/code/PARSE_FAILED';
export const SET_AST = 'bblfsh/code/SET_AST';
export const CHANGE = 'bblfsh/code/CHANGE';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET:
      return {
        ...reducer(state, {
          type: SET_AST,
          ast: action.ast,
        }),
        filename: action.filename,
        code: action.code,
        markRange: null,
      };
    case PARSE:
      return {
        ...state,
        uastJson: null,
        posIndex: null,
        parsing: true,
      };
    case PARSE_FAILED:
      return {
        ...state,
        parsing: false,
      };
    case SET_AST:
      return {
        ...state,
        parsing: false,
        dirty: false,
        uastJson: action.ast,
      };
    case CHANGE:
      return {
        ...state,
        code: action.code,
        dirty: true,
      };
    default:
      return state;
  }
};

export const set = (filename, code, ast) => ({
  type: SET,
  filename,
  code: code || null,
  ast: ast || null,
});

export const setAst = ast => ({
  type: SET_AST,
  ast,
});

export const change = code => ({
  type: CHANGE,
  code,
});

export const runParserWithQuery = () => (dispatch, getState) => {
  const state = getState();
  const {
    code: { code, filename },
    options: { customServer, customServerUrl, parseMode, uastQuery },
    languages: { selected: languageSelected },
  } = state;

  dispatch(errorsClear('parse'));
  dispatch({ type: PARSE });

  // there is no action for custom server update, run parser is such an action
  dispatch(versionUpdateIfNeeded());
  dispatch(driversUpdateIfNeeded());

  return api
    .parse(
      parseMode,
      languageSelected,
      filename,
      code,
      uastQuery,
      customServer ? customServerUrl : undefined
    )
    .then(({ uast, language }) => {
      dispatch(languageSet(language));
      dispatch(setAst(uast));
    })
    .catch(errors => {
      dispatch({ type: PARSE_FAILED });
      dispatch(errorsAdd(errors, 'parse'));
    });
};

export const runParser = () => dispatch => {
  dispatch(setUastQuery(''));
  return dispatch(runParserWithQuery());
};
