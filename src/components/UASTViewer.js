import React, { Component } from 'react';
import styled from 'styled-components';
import Node from './uast/Node';
import NodeIndex from './uast/NodeIndex';
import { font, background } from '../styling/variables';

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

export default class UASTViewer extends Component {
  constructor(props) {
    super(props);
    this.index = new NodeIndex();
    this.addToIndex = node => this.index.add(node);
    this.resetIndex(props);
  }

  resetIndex({ ast }) {
    this.index.clear();
    this.activeNode = null;
    this.ast = ast;
  }

  componentWillUpdate(nextProps) {
    if (this.ast !== nextProps.ast) {
      this.resetIndex(nextProps);
    }
  }

  selectNode({ line, ch }) {
    if (this.activeNode) {
      this.activeNode.unHighlight();
    }

    this.activeNode = this.index.get({ Line: line + 1, Col: ch + 1 });
    if (this.activeNode) {
      this.activeNode.expand();
      this.activeNode.highlight();
    }
  }

  render() {
    return (
      <Container onMouseOut={this.props.clearNodeSelection}>
        <Node
          tree={this.props.ast}
          showLocations={this.props.showLocations}
          onNodeSelected={this.props.onNodeSelected}
          onMount={this.addToIndex}
        />
      </Container>
    );
  }
}
