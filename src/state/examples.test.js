import { reducer, initialState, SET, RESET } from './examples';

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
