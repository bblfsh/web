import { reducer, initialState, ADD, SET, REMOVE, CLEAR } from './errors';

describe('errors/reducer', () => {
  it('ADD', () => {
    expect(
      reducer(initialState, { type: ADD, errors: ['error1'] })
    ).toMatchSnapshot();
    expect(
      reducer(initialState.concat(['error1']), {
        type: ADD,
        errors: ['error2'],
      })
    ).toMatchSnapshot();
  });

  it('SET', () => {
    expect(
      reducer(initialState.concat(['error1']), {
        type: SET,
        errors: ['error2'],
      })
    ).toMatchSnapshot();
  });

  it('REMOVE', () => {
    expect(
      reducer(initialState.concat(['error1', 'error2', 'error3']), {
        type: REMOVE,
        idx: 1,
      })
    ).toMatchSnapshot();
  });

  it('CLEAR', () => {
    expect(
      reducer(initialState.concat(['error1']), { type: CLEAR })
    ).toMatchSnapshot();
  });
});
