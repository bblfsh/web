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

  // for search server returns [result, result, result]
  // in case when all the results are nodes we can ignore wrapper node
  // and display only results for better UI/UX.
  //
  // for values (strings, ints, bool) we have to keep the wrapping node
  // otherwise it's not a tree and uast-viewer wouldn't be able to display it
  if (Array.isArray(rootNode.n) && rootNode.n.every(c => c.id !== undefined)) {
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
