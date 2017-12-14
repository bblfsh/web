import React, { Component } from 'react';
import styled from 'styled-components';
import Node from './uast/Node';
import { font, background } from '../styling/variables';
import { connect } from 'react-redux';
import { markRange } from '../state/code';

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
  render() {
    return (
      <Container onMouseOut={this.props.clearNodeSelection}>
        {this.props.rootNodeId ? (
          <Node
            id={this.props.rootNodeId}
            onNodeSelected={this.props.onNodeSelected}
          />
        ) : null}
      </Container>
    );
  }
}

export const mapStateToProps = state => {
  let rootNodeId = 1;
  if (!state.code.ast || !state.code.ast[1]) {
    rootNodeId = null;
  }

  return {
    rootNodeId,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearNodeSelection: () => dispatch(markRange()),
    onNodeSelected: (from, to) => dispatch(markRange(from, to)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UASTViewer);
