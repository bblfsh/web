import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './state';
import 'normalize.css';
import { injectGlobal } from 'styled-components';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './vendor.css';
import { polyfill as es6PromisesPolyfill } from 'es6-promise';
import 'isomorphic-fetch';
import { font } from './styling/variables';

es6PromisesPolyfill();

// eslint-disable-next-line
injectGlobal`
  * {
    box-sizing: border-box;
  }

  body, html {
    font-size: ${font.size.html};
    font-family: ${font.family.prose};
  }
`;

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
