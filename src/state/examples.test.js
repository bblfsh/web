import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

import {
  reducer,
  initialState,
  SET,
  RESET,
  examples,
  select,
} from './examples';
import { set as codeSet } from './code';
import { set as languageSet } from './languages';

describe('examples/reducer', () => {
  it('SET', () => {
    expect(
      reducer(initialState, { type: SET, selected: 'java_example_1' })
    ).toMatchSnapshot();
  });

  it('RESET', () => {
    expect(
      reducer(initialState, {
        type: RESET,
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
    const example = examples[key];
    store.dispatch(select(key));
    expect(store.getActions()).toEqual([
      codeSet(example.name, example.code),
      languageSet(example.language),
      {
        type: SET,
        selected: key,
      },
    ]);
  });
});
