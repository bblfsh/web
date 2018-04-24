import * as history from '../services/history';
import * as code from './code';
import * as languages from './languages';

import { java_example_1 } from '../examples/hello.java.js';
import { java_example_2 } from '../examples/swap.java.js';
import { python_example_1 } from '../examples/fizzbuzz.py.js';
import { python_example_2 } from '../examples/classdef.py.js';
import { go_example_1 } from '../examples/golang.go.js';
import { php_example_1 } from '../examples/phphtml.php.js';
import { php_example_2 } from '../examples/phpv7.php.js';
import { javascript_example_1 } from '../examples/javascript.js.js';
import { ruby_example_1 } from '../examples/ruby.rb.js';

export const DEFAULT_EXAMPLE = 'java_example_1';
const LANG_JAVA = 'java';
const LANG_PYTHON = 'python';
const LANG_GO = 'go';
const LANG_PHP = 'php';
const LANG_JS = 'javascript';
const LANG_RUBY = 'ruby';

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
  go_example_1: {
    name: 'golang.go',
    language: LANG_GO,
    code: go_example_1,
  },
  php_example_1: {
    name: 'phphtml.php',
    language: LANG_PHP,
    code: php_example_1,
  },
  php_example_2: {
    name: 'phpv7.php',
    language: LANG_PHP,
    code: php_example_2,
  },
  javascript_example_1: {
    name: 'javascript.js',
    language: LANG_JS,
    code: javascript_example_1,
  },
  ruby_example_1: {
    name: 'ruby.rb',
    language: LANG_RUBY,
    code: ruby_example_1,
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
