import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fetchMock from 'jest-fetch-mock';

configure({ adapter: new Adapter() });

global.fetch = fetchMock;

// CodeMirror needs all of this in order to work.
// see: https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/5
global.document.body.createTextRange = function() {
  return {
    setEnd() {},
    setStart() {},
    getBoundingClientRect() {
      return { right: 0 };
    },
    getClientRects() {
      return {
        length: 0,
        left: 0,
        right: 0,
      };
    },
  };
};
