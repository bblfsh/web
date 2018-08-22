import React, { Component } from 'react';
import Viewer from 'uast-viewer';
import styled from 'styled-components';
import { nodeSchema as schema } from 'uast-viewer/es/uast-v2';

const ROOT_ID = 1;
export const SEARCH_RESULTS_TYPE = 'Dashboard: Search results';

export const getSearchResults = uast => {
  if (!uast) {
    return null;
  }

  const rootNode = uast[ROOT_ID];
  if (!rootNode) {
    return null;
  }

  if (rootNode.InternalType === SEARCH_RESULTS_TYPE) {
    return rootNode.Children;
  }

  return null;
};

const NotFound = styled.div`
  width: 100%;
  padding: 1rem 0;
  text-align: center;
`;

class UASTViewer extends Component {
  render() {
    const { uastViewerProps, showLocations } = this.props;
    const { uast } = uastViewerProps;

    if (!uast) {
      return null;
    }

    const searchResults = getSearchResults(uast);
    let rootIds = searchResults || [ROOT_ID];

    if (searchResults && !searchResults.length) {
      return <NotFound>Nothing found</NotFound>;
    }

    return (
      <Viewer
        {...uastViewerProps}
        rootIds={rootIds}
        showLocations={showLocations}
        style={{ overflow: 'auto' }}
        schema={schema}
      />
    );
  }
}

export default UASTViewer;
