import React, { Component } from 'react';
import styled from 'styled-components';
import Node from './uast/Node';
import SearchResults from './uast/SearchResults';
import { font, background } from '../styling/variables';
import { connect } from 'react-redux';
import { markRange } from '../state/code';
import { getNodeRootId, getSearchResults } from '../state/ast';

const Container = styled.div`
  height: 100%;
  min-width: 0; // disable this min-sizing behavior of flexbox because of scrollable div inside
  width: 100%;
  overflow: auto;
  font-family: ${font.family.code};
  font-size: ${font.size.large};
  background: ${background.main};
  line-height: ${font.lineHeight.large};
  padding: 4px;
`;

export class UASTViewer extends Component {
  content() {
    const { rootNodeId, searchResults, onNodeSelected } = this.props;

    if (!rootNodeId) {
      return null;
    }

    if (searchResults !== null) {
      return (
        <SearchResults
          resultIds={searchResults}
          onNodeSelected={onNodeSelected}
        />
      );
    }

    return <Node id={rootNodeId} onNodeSelected={onNodeSelected} />;
  }

  render() {
    const { clearNodeSelection } = this.props;

    return (
      <Container onMouseOut={clearNodeSelection}>{this.content()}</Container>
    );
  }
}

export const mapStateToProps = state => {
  return {
    rootNodeId: getNodeRootId(state),
    searchResults: getSearchResults(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearNodeSelection: () => dispatch(markRange()),
    onNodeSelected: (from, to) => dispatch(markRange(from, to)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UASTViewer);
