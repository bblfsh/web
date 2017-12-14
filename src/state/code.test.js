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
  MARK,
  runParser,
  setAst,
  selectNodeByPos,
} from './code';
import {
  NODE_EXPAND,
  NODE_TOGGLE,
  NODE_HIGHLIGHT,
  NODE_UNHIGHLIGHT,
  expand,
  nodeHighlight,
  nodeUnhighlight,
} from './ast';
import { set as languageSet } from './languages';
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

  it('MARK', () => {
    expect(
      reducer(initialState, { type: MARK, range: { from: 1, to: 2 } })
    ).toMatchSnapshot();
  });

  const initialWithNode = {
    ...initialState,
    ast: {
      1: {
        id: 1,
        expanded: false,
        higlighted: false,
      },
    },
  };

  it('NODE_EXPAND', () => {
    expect(
      reducer(initialWithNode, { type: NODE_EXPAND, nodeId: 1 })
    ).toMatchSnapshot();
  });

  it('NODE_TOGGLE', () => {
    expect(
      reducer(initialWithNode, { type: NODE_TOGGLE, nodeId: 1 })
    ).toMatchSnapshot();

    expect(
      reducer(
        {
          ...initialWithNode,
          ast: {
            ...initialWithNode.ast,
            1: {
              ...initialWithNode.ast[1],
              expanded: true,
            },
          },
        },
        { type: NODE_TOGGLE, nodeId: 1 }
      )
    ).toMatchSnapshot();
  });

  it('NODE_HIGHLIGHT', () => {
    expect(
      reducer(initialWithNode, { type: NODE_HIGHLIGHT, nodeId: 1 })
    ).toMatchSnapshot();
  });

  it('NODE_UNHIGHLIGHT', () => {
    expect(
      reducer(
        {
          ...initialWithNode,
          ast: {
            ...initialWithNode.ast,
            1: {
              ...initialWithNode.ast[1],
              higlighted: true,
            },
          },
        },
        { type: NODE_UNHIGHLIGHT, nodeId: 1 }
      )
    ).toMatchSnapshot();
  });
});

describe('code/actions', () => {
  it('selectNodeByPos', () => {
    const pos = { line: 1, ch: 1 };
    const posIndex = {
      get: jest.fn(() => ({ id: 3 })),
    };

    const store = mockStore({
      code: {
        ...initialState,
        posIndex,
        ast: {
          1: { id: 1, InternalType: 'root' },
          2: { id: 2, InternalType: 'child1', parentId: 1 },
          3: { id: 3, InternalType: 'child12', parentId: 2 },
          4: { id: 4, InternalType: 'child2', parent: 1, highlighted: true },
        },
      },
    });

    store.dispatch(selectNodeByPos(pos));
    expect(store.getActions()).toEqual([
      nodeUnhighlight(4),
      expand(3),
      expand(2),
      expand(1),
      nodeHighlight(3),
    ]);
  });

  it('runParser', () => {
    const uast = { InternalType: 'root' };
    fetch.mockResponse(JSON.stringify({ status: 0, uast, language: 'python' }));

    const store = mockStore({
      code: { code: 'foo = 1', filename: 'test.py' },
      options: { customServer: false, customServerUrl: '' },
      languages: { selected: '' },
    });
    const expectedActions = [
      errorsClear(),
      { type: PARSE },
      languageSet('python'),
      setAst(uast),
    ];

    return store.dispatch(runParser()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
