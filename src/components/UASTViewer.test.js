import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import UASTViewer from './UASTViewer';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchSnapshot();
};

it('empty render', () => {
  shouldMatchSnapshot(<UASTViewer uastViewerProps={{ uast: {} }} />);
});

const posValue = {
  '@type': 'uast:Position',
  start: {
    '@type': 'uast:Position',
    line: 1,
    col: 1,
  },
  end: {
    '@type': 'uast:Position',
    line: 2,
    col: 2,
  },
};

it('tree render', () => {
  const uastViewerProps = {
    uast: {
      1: { id: 1, expanded: true, n: { '@pos': posValue } },
    },
  };

  shouldMatchSnapshot(
    <UASTViewer uastViewerProps={uastViewerProps} showLocations={false} />
  );
});

it('tree render with locations', () => {
  const uastViewerProps = {
    uast: {
      1: { id: 1, expanded: true, n: { '@pos': posValue } },
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
        1: { id: 1, n: [{ id: 2 }] },
        2: { id: 2, n: { '@type': 'TestType' } },
      },
    };

    shouldMatchSnapshot(<UASTViewer uastViewerProps={uastViewerProps} />);
  });

  it('empty', () => {
    const uastViewerProps = {
      uast: {
        1: { id: 1, n: [] },
      },
    };

    shouldMatchSnapshot(<UASTViewer uastViewerProps={uastViewerProps} />);
  });
});
