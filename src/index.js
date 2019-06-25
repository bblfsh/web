import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './state';
import 'normalize.css';
import App from './App';
import { unregister } from './registerServiceWorker';

import './vendor.css';
import { polyfill as es6PromisesPolyfill } from 'es6-promise';
import 'isomorphic-fetch';

es6PromisesPolyfill();

import './styling/index.less';

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
unregister();
