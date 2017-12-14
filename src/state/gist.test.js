import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { add as errorsAdd } from './errors';

const mockStore = configureMockStore([thunk]);

import { reducer, initialState, SET_URL, SET, load } from './gist';
import { set as codeSet } from './code';
import { reset as examplesReset } from './examples';

describe('gist/reducer', () => {
  it('SET_URL', () => {
    expect(
      reducer(initialState, {
        type: SET_URL,
        url: 'https://gist.githubusercontent.com/gist1',
      })
    ).toMatchSnapshot();
    expect(
      reducer(initialState, {
        type: SET_URL,
        url: 'invalid',
      })
    ).toMatchSnapshot();
  });

  it('SET', () => {
    expect(
      reducer(initialState, {
        type: SET,
        gist: 'gist1',
      })
    ).toMatchSnapshot();
  });
});

describe('gist/actions', () => {
  it('load success', () => {
    fetch.mockResponse('gist content');

    const store = mockStore({
      gist: { ...initialState, gist: 'gist1.py', isValid: true },
    });
    const expectedActions = [
      examplesReset(),
      codeSet('', null),
      codeSet('gist1.py', 'gist content'),
    ];

    return store.dispatch(load()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('load failed', () => {
    fetch.mockReject();

    const store = mockStore({
      gist: { ...initialState, gist: 'gist1.py', isValid: true },
    });
    // null because fetch-mock doesn't return any error, only rejects promise
    const expectedActions = [
      examplesReset(),
      codeSet('', null),
      errorsAdd([null]),
    ];

    return store
      .dispatch(load())
      .catch(() => null)
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('load impossible', () => {
    const store = mockStore({
      gist: initialState,
    });

    // jest's .rejects.toThrow() doesn't work in this case
    let rejected = false;
    return store
      .dispatch(load())
      .catch(() => {
        rejected = true;
      })
      .then(() => {
        expect(rejected).toBe(true);
      });
  });
});
