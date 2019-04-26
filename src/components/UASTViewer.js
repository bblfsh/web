import React, { Component } from 'react';
import FlatUASTViewer from 'uast-viewer';

const ROOT_ID = 1;

export const getSearchResults = uast => {
  if (!uast) {
    return null;
  }

  const rootNode = uast[ROOT_ID];
  if (!rootNode) {
    return null;
  }

  if (Array.isArray(rootNode.n)) {
    return rootNode.n.map(c => c.id);
  }

  return null;
};

class UASTViewer extends Component {
  render() {
    const { uastViewerProps, showLocations } = this.props;
    const { flatUast } = uastViewerProps;

    if (!flatUast) {
      return null;
    }

    const searchResults = getSearchResults(flatUast);
    let rootIds = searchResults || [ROOT_ID];

    if (searchResults && !searchResults.length) {
      return <div className="bblfsh-uast-viewer__not-found">Nothing found</div>;
    }

    return (
      <FlatUASTViewer
        {...uastViewerProps}
        rootIds={rootIds}
        showLocations={showLocations}
        style={{ overflow: 'auto' }}
      />
    );
  }
}

export default UASTViewer;
