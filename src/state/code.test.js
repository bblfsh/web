import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

import {
  reducer,
  initialState,
  SET,
  PARSE,
  PARSE_FAILED,
  SET_AST,
  CHANGE,
  runParserWithQuery,
  runParser,
  setAst,
} from './code';
import { set as languageSet } from './languages';
import { setUastQuery } from './options';
import { clear as errorsClear } from './errors';

describe('code/reducer', () => {
  it('SET', () => {
    expect(
      reducer(initialState, {
        type: SET,
        filename: 'file.py',
        code: 'foo = 1',
        ast: { InternalType: 'file' },
      })
    ).toMatchSnapshot();
  });

  it('PARSE', () => {
    expect(
      reducer(
        {
          ...initialState,
          ast: { 1: { id: 1 } },
          posIndex: 'index',
          parsing: false,
        },
        {
          type: PARSE,
        }
      )
    ).toMatchSnapshot();
  });

  it('PARSE_FAILED', () => {
    expect(
      reducer({ ...initialState, parsing: true }, { type: PARSE_FAILED })
    ).toMatchSnapshot();
  });

  it('SET_AST', () => {
    expect(
      reducer(initialState, { type: SET_AST, ast: { 1: { id: 1 } } })
    ).toMatchSnapshot();
  });

  it('CHANGE', () => {
    expect(
      reducer(
        { ...initialState, code: 'foo = 1' },
        { type: CHANGE, code: 'bar = 1' }
      )
    ).toMatchSnapshot();
  });
});

describe('code/actions', () => {
  it('runParserWithQuery', () => {
    const uast = { InternalType: 'root' };
    fetch.mockResponse(JSON.stringify({ status: 0, uast, language: 'python' }));

    const store = mockStore({
      code: { code: 'foo = 1', filename: 'test.py', query: 'test-query' },
      options: { mode: 'semantic', customServer: false, customServerUrl: '' },
      languages: { selected: '' },
      versions: { loadedFrom: undefined },
    });
    const expectedActions = [
      errorsClear('parse'),
      { type: PARSE },
      languageSet('python'),
      setAst(uast),
    ];

    return store.dispatch(runParserWithQuery()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('runParser', () => {
    const uast = { InternalType: 'root' };
    fetch.mockResponse(JSON.stringify({ status: 0, uast, language: 'python' }));

    const store = mockStore({
      code: { code: 'foo = 1', filename: 'test.py' },
      options: { mode: 'semantic', customServer: false, customServerUrl: '' },
      languages: { selected: '' },
      versions: { loadedFrom: undefined },
    });
    const expectedActions = [
      setUastQuery(''),
      errorsClear('parse'),
      { type: PARSE },
      languageSet('python'),
      setAst(uast),
    ];

    return store.dispatch(runParser()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
