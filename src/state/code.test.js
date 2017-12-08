import {
  reducer,
  initialState,
  SET,
  PARSE,
  PARSE_FAILED,
  SET_AST,
  CHANGE,
  MARK,
} from './code';
import {
  NODE_EXPAND,
  NODE_TOGGLE,
  NODE_HIGHLIGHT,
  NODE_UNHIGHLIGHT,
} from './ast';

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
