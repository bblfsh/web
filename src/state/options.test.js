import {
  reducer,
  initialState,
  LOCATIONS_TOGGLE,
  CUSTOM_SERVER_URL_SET,
  CUSTOM_SERVER_TOGGLE,
} from './options';

describe('options/reducer', () => {
  it('LOCATIONS_TOGGLE', () => {
    expect(
      reducer(
        { ...initialState, showLocations: true },
        { type: LOCATIONS_TOGGLE }
      )
    ).toMatchSnapshot();
    expect(reducer(initialState, { type: LOCATIONS_TOGGLE })).toMatchSnapshot();
  });

  it('CUSTOM_SERVER_URL_SET', () => {
    expect(
      reducer(initialState, {
        type: CUSTOM_SERVER_URL_SET,
        url: 'newUrl',
      })
    ).toMatchSnapshot();
  });

  it('CUSTOM_SERVER_TOGGLE', () => {
    expect(
      reducer(initialState, { type: CUSTOM_SERVER_TOGGLE })
    ).toMatchSnapshot();
    expect(
      reducer(
        { ...initialState, customServer: true },
        { type: CUSTOM_SERVER_TOGGLE }
      )
    ).toMatchSnapshot();
  });
});
