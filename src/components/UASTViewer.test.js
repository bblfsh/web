import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import UASTViewer, { SEARCH_RESULTS_TYPE } from './UASTViewer';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchSnapshot();
};

it('empty render', () => {
  shouldMatchSnapshot(<UASTViewer uastViewerProps={{ uast: {} }} />);
});

it('tree render', () => {
  const uastViewerProps = {
    uast: {
      1: { id: 1, expanded: true, StartPosition: { Line: 1, Col: 2 } },
    },
  };

  shouldMatchSnapshot(
    <UASTViewer uastViewerProps={uastViewerProps} showLocations={false} />
  );
});

it('tree render with locations', () => {
  const uastViewerProps = {
    uast: {
      1: { id: 1, expanded: true, StartPosition: { Line: 1, Col: 2 } },
    },
  };

  shouldMatchSnapshot(
    <UASTViewer uastViewerProps={uastViewerProps} showLocations={true} />
  );
});

describe('search results', () => {
  it('render', () => {
    const uastViewerProps = {
      uast: {
        1: { id: 1, InternalType: SEARCH_RESULTS_TYPE, Children: [2] },
        2: { id: 2, InternalType: 'TestType' },
      },
    };

    shouldMatchSnapshot(<UASTViewer uastViewerProps={uastViewerProps} />);
  });

  it('empty', () => {
    const uastViewerProps = {
      uast: {
        1: { id: 1, InternalType: SEARCH_RESULTS_TYPE, Children: [] },
      },
    };

    shouldMatchSnapshot(<UASTViewer uastViewerProps={uastViewerProps} />);
  });
});
