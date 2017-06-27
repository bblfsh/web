import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import { injectGlobal } from 'styled-components';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './vendor.css';

// eslint-disable-next-line
injectGlobal`
  * {
    box-sizing: border-box;
  }

  body, html {
    font-size: 16px;
    font-family: 'Lato', sans-serif;
  }
`;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
