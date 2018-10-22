export const initialState = {
  showLocations: false,
  customServer: false,
  customServerUrl: '',
  uastQuery: '',
  parseMode: 'semantic',
};

export const LOCATIONS_TOGGLE = 'bblfsh/options/LOCATIONS_TOGGLE';
export const CUSTOM_SERVER_URL_SET = 'bblfsh/options/CUSTOM_SERVER_URL_SET';
export const CUSTOM_SERVER_TOGGLE = 'bblfsh/options/CUSTOM_SERVER_TOGGLE';
export const SET_UAST_QUERY = 'bblfsh/options/SET_UAST_QUERY';
export const SET_PARSE_MODE = 'bblfsh/options/SET_PARSE_MODE';

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
    case SET_PARSE_MODE:
      return {
        ...state,
        parseMode: action.mode,
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

export const setParseMode = mode => ({
  type: SET_PARSE_MODE,
  mode,
});

export const isUrl = url => /^[a-zA-Z0-9][^/]+$/.test(url);
