import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UASTViewer } from './UASTViewer';

const mockStore = configureStore();

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchStyledComponentsSnapshot();
};

it('empty render', () => {
  shouldMatchSnapshot(<UASTViewer />);
});

it('tree render', () => {
  const store = mockStore({
    code: {
      ast: {
        1: { id: 1 },
      },
    },
    options: { showLocations: false },
  });
  shouldMatchSnapshot(
    <Provider store={store}>
      <UASTViewer rootNodeId={1} searchResults={null} />
    </Provider>
  );
});

it('search results render', () => {
  shouldMatchSnapshot(<UASTViewer rootNodeId={1} searchResults={[]} />);
});
