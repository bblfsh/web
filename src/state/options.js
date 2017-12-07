const initialState = {
  showLocations: false,
  customServer: false,
  customServerUrl: '',
};

export const LOCATIONS_TOGGLE = 'bblfsh/languages/LOCATIONS_TOGGLE';
export const CUSTOM_SERVER_URL_SET = 'bblfsh/languages/CUSTOM_SERVER_URL_SET';
export const CUSTOM_SERVER_TOGGLE = 'bblfsh/languages/CUSTOM_SERVER_TOGGLE';

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

export const isUrl = url => /^[a-zA-Z0-9][^/]+$/.test(url);
