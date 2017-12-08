import { reducer, initialState, SET_URL, SET } from './gist';

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
