import {
  reducer,
  initialState,
  LOADING,
  LOADED,
  SET,
  SELECT,
} from './languages';

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
