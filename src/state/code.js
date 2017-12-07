import * as api from 'services/api';
import {
  nodeReducer,
  convertTree,
  nodeHighlight,
  nodeUnhighlight,
  expand,
} from './ast';
import { set as languageSet } from './languages';
import { add as errorsAdd, clear as errorsClear } from './errors';

const initialState = {
  filename: undefined,
  code: null,
  ast: {},
  posIndex: null,

  dirty: false,
  markRange: null,
  parsing: false,
};

export const SET = 'bblfsh/code/SET';
export const PARSE = 'bblfsh/code/PARSE';
export const PARSE_FAILED = 'bblfsh/code/PARSE_FAILED';
export const SET_AST = 'bblfsh/code/SET_AST';
export const CHANGE = 'bblfsh/code/CHANGE';
export const MARK = 'bblfsh/code/MARK';

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
        dirty: true,
        markRange: null,
      };
    case PARSE:
      return {
        ...state,
        ast: {},
        posIndex: null,
        parsing: true,
      };
    case PARSE_FAILED:
      return {
        ...state,
        parsing: false,
      };
    case SET_AST:
      const { tree, posIndex } = convertTree(action.ast);
      return {
        ...state,
        ast: tree,
        posIndex,
        parsing: false,
      };
    case CHANGE:
      return {
        ...state,
        code: action.code,
        dirty: true,
      };
    case MARK:
      return {
        ...state,
        markRange: action.range,
      };
    default:
      if (action.nodeId) {
        const node = state.ast[action.nodeId];
        return {
          ...state,
          ast: {
            ...state.ast,
            [action.nodeId]: nodeReducer(node, action),
          },
        };
      }
      return state;
  }
};

export const set = (filename, code, ast) => ({
  type: SET,
  filename,
  code: code || null,
  ast: ast || {},
});

export const setAst = ast => ({
  type: SET_AST,
  ast,
});

export const change = code => ({
  type: CHANGE,
  code,
});

export const markRange = (from, to) => {
  return {
    type: MARK,
    range: from || to ? { from, to } : null,
  };
};

export const selectNodeByPos = ({ line, ch }) => (dispatch, getState) => {
  const { code } = getState();
  if (!code.posIndex) {
    return;
  }
  const node = code.posIndex.get({ Line: line + 1, Col: ch + 1 });
  if (!node) {
    return;
  }
  const highlightedNode = Object.values(code.ast).find(n => n.highlighted);
  if (highlightedNode) {
    dispatch(nodeUnhighlight(highlightedNode.id));
  }
  // expand tree
  let id = node.id;
  while (id) {
    dispatch(expand(id));
    id = code.ast[id].parentId;
  }
  return dispatch(nodeHighlight(node.id));
};

export const runParser = () => (dispatch, getState) => {
  const state = getState();
  const {
    code: { code, filename },
    options: { customServer, customServerUrl },
    languages: { selected: languageSelected },
  } = state;

  dispatch(errorsClear());
  dispatch({ type: PARSE });

  api
    .parse(
      languageSelected,
      filename,
      code,
      customServer ? customServerUrl : undefined
    )
    .then(({ uast, language }) => {
      dispatch(languageSet(language));
      dispatch(setAst(uast));
    })
    .catch(errors => {
      dispatch({ type: PARSE_FAILED });
      dispatch(errorsAdd(errors));
    });
};
