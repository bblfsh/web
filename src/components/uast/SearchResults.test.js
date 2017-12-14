import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SearchResults from './SearchResults';

const mockStore = configureStore();

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchStyledComponentsSnapshot();
};

describe('SearchResults', () => {
  it('should render children nodes', () => {
    const store = mockStore({
      code: {
        ast: {
          2: { id: 2, InternalType: 'Child1' },
          3: { id: 3, InternalType: 'Child2' },
        },
      },
      options: { showLocations: false },
    });
    shouldMatchSnapshot(
      <Provider store={store}>
        <SearchResults resultIds={[2, 3]} />
      </Provider>
    );
  });

  it('should render not found', () => {
    shouldMatchSnapshot(<SearchResults resultIds={[]} />);
  });
});
