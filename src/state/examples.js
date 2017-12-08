import * as history from 'services/history';
import * as code from './code';
import * as languages from './languages';

import { java_example_1 } from 'examples/hello.java.js';
import { java_example_2 } from 'examples/swap.java.js';
import { python_example_1 } from 'examples/fizzbuzz.py.js';
import { python_example_2 } from 'examples/classdef.py.js';

export const DEFAULT_EXAMPLE = 'java_example_1';
const LANG_JAVA = 'java';
const LANG_PYTHON = 'python';

export const examples = {
  java_example_1: {
    name: 'hello.java',
    language: LANG_JAVA,
    code: java_example_1,
  },
  java_example_2: {
    name: 'swap.java',
    language: LANG_JAVA,
    code: java_example_2,
  },
  python_example_1: {
    name: 'fizzbuzz.py',
    language: LANG_PYTHON,
    code: python_example_1,
  },
  python_example_2: {
    name: 'classdef.py',
    language: LANG_PYTHON,
    code: python_example_2,
  },
};

export const initialState = {
  selected: '',
};

export const SET = 'bblfsh/examples/SET';
export const RESET = 'bblfsh/examples/RESET';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET:
      return {
        ...state,
        selected: action.selected,
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
};

export const select = key => dispatch => {
  if (!key) {
    return;
  }

  const example = examples[key];

  dispatch(code.set(example.name, example.code));
  dispatch(languages.set(example.language));

  // url side effect
  history.setExample();

  return dispatch({
    type: SET,
    selected: key,
  });
};

export const reset = () => ({ type: RESET });
