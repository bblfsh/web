import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

import {
  reducer,
  initialState,
  SET,
  RESET,
  SET_LIST_BY_LANGS,
  select,
} from './examples';
import { set as codeSet } from './code';
import { set as languageSet, SELECT as LANG_SELECT } from './languages';
import { java_example_1 } from '../examples/hello.java.js';

describe('examples/reducer', () => {
  it('SET', () => {
    expect(
      reducer(
        {
          ...initialState,
          list: {
            java_example_1: {
              name: 'hello.java',
              language: 'java',
              code: java_example_1,
            },
          },
        },
        { type: SET, selected: 'java_example_1' }
      )
    ).toMatchSnapshot();
  });

  it('RESET', () => {
    expect(
      reducer(initialState, {
        type: RESET,
      })
    ).toMatchSnapshot();
  });

  it('SET_LIST_BY_LANGS', () => {
    expect(
      reducer(initialState, {
        type: SET_LIST_BY_LANGS,
        languages: ['java', 'python'],
      })
    ).toMatchSnapshot();
  });
});

describe('examples/actions', () => {
  it('select', () => {
    const store = mockStore({
      examples: initialState,
    });

    const key = 'java_example_1';
    const example = {
      name: 'hello.java',
      language: 'java',
      code: java_example_1,
    };
    store.dispatch(select(key));
    expect(store.getActions()).toEqual([
      codeSet(example.name, example.code),
      {
        type: LANG_SELECT,
        selected: '',
      },
      languageSet(example.language),
      {
        type: SET,
        selected: key,
      },
    ]);
  });
});
