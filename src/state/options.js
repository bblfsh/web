export const initialState = {
  showLocations: false,
  customServer: false,
  customServerUrl: '',
  uastQuery: '',
};

export const LOCATIONS_TOGGLE = 'bblfsh/options/LOCATIONS_TOGGLE';
export const CUSTOM_SERVER_URL_SET = 'bblfsh/options/CUSTOM_SERVER_URL_SET';
export const CUSTOM_SERVER_TOGGLE = 'bblfsh/options/CUSTOM_SERVER_TOGGLE';
export const SET_UAST_QUERY = 'bblfsh/options/SET_UAST_QUERY';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATIONS_TOGGLE:
      return {
        ...state,
        showLocations: !state.showLocations,
      };
    case CUSTOM_SERVER_URL_SET:
      return {
        ...state,
        customServerUrl: action.url,
      };
    case CUSTOM_SERVER_TOGGLE:
      return {
        ...state,
        customServer: !state.customServer,
        customServerUrl: state.customServer ? '' : '0.0.0.0:9432',
      };
    case SET_UAST_QUERY:
      return {
        ...state,
        uastQuery: action.query,
      };
    default:
      return state;
  }
};

export const locationsToggle = () => ({ type: LOCATIONS_TOGGLE });

export const setCustomServerUrl = url => ({
  type: CUSTOM_SERVER_URL_SET,
  url,
});
export const customServerToggle = () => ({ type: CUSTOM_SERVER_TOGGLE });
export const setUastQuery = query => ({
  type: SET_UAST_QUERY,
  query,
});

export const isUrl = url => /^[a-zA-Z0-9][^/]+$/.test(url);
