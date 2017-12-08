import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

import {
  reducer,
  initialState,
  LOADING,
  LOADED,
  LOAD_FAILED,
  SET,
  SELECT,
  load,
  select,
  getLanguageMode,
} from './languages';
import { add as errorsAdd } from './errors';

describe('languages/reducer', () => {
  it('LOADING', () => {
    expect(reducer(initialState, { type: LOADING })).toMatchSnapshot();
  });

  it('LOADED', () => {
    expect(
      reducer(
        { ...initialState, loading: true },
        {
          type: LOADED,
          languages: { python: { name: 'python' } },
        }
      )
    ).toMatchSnapshot();
  });

  it('LOAD_FAILED', () => {
    expect(
      reducer({ ...initialState, loading: true }, { type: LOAD_FAILED })
    ).toMatchSnapshot();
  });

  it('SET', () => {
    expect(
      reducer(initialState, { type: SET, actual: 'python' })
    ).toMatchSnapshot();
  });

  it('SELECT', () => {
    expect(
      reducer(initialState, { type: SELECT, selected: 'python' })
    ).toMatchSnapshot();
  });
});

describe('languages/actions', () => {
  it('load', () => {
    fetch.mockResponse(
      JSON.stringify([
        { id: 'python', name: 'Python', url: 'python-driver' },
        { id: 'java', name: 'Java', url: 'java-driver' },
      ])
    );

    const store = mockStore({ languages: initialState });
    const expectedActions = [
      { type: LOADING },
      {
        type: LOADED,
        languages: {
          java: { mode: 'text/x-java', name: 'Java', url: 'java-driver' },
          python: { mode: 'python', name: 'Python', url: 'python-driver' },
        },
      },
    ];

    return store.dispatch(load()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('load failed', () => {
    fetch.mockReject();

    const store = mockStore({ languages: initialState });
    const expectedActions = [
      { type: LOADING },
      { type: LOAD_FAILED },
      errorsAdd(['Unable to load the list of available drivers.']),
    ];

    return store.dispatch(load()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('select', () => {
    const store = mockStore({
      languages: {
        ...initialState,
        languages: {
          ...initialState.languages,
          python: { name: 'python' },
        },
      },
    });

    store.dispatch(select('python'));
    expect(store.getActions()).toEqual([
      {
        type: SELECT,
        selected: 'python',
      },
    ]);

    store.clearActions();

    store.dispatch(select('unknown'));
    expect(store.getActions()).toEqual([
      {
        type: SELECT,
        selected: '',
      },
    ]);
  });
});

describe('getLanguageMode', () => {
  it('has selected language', () => {
    const mode = getLanguageMode({
      languages: {
        languages: {
          java: { mode: 'x-java' },
        },
        selected: 'java',
        actual: 'java',
      },
    });
    expect(mode).toEqual('x-java');
  });

  it('has actual language', () => {
    const mode = getLanguageMode({
      languages: {
        languages: {
          java: { mode: 'x-java' },
        },
        selected: '',
        actual: 'java',
      },
    });
    expect(mode).toEqual('x-java');
  });

  it('unknown language', () => {
    const mode = getLanguageMode({
      languages: {
        languages: {
          java: { mode: 'x-java' },
        },
        selected: '',
        actual: '',
      },
    });
    expect(mode).toEqual('');
  });
});
