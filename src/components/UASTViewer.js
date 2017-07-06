import React, { Component } from 'react';
import styled from 'styled-components';
import Node from './uast/Node';
import NodeIndex from './uast/NodeIndex';
import { font, background } from '../styling/variables';

const Container = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: auto;
  font-family: ${font.family.code};
  font-size: ${font.size.large};
  background: ${background.main};
  line-height: ${font.lineHeight.large};
  padding: 4px;
`

export default class UASTViewer extends Component {
  constructor(props) {
    super(props);
    this.index = new NodeIndex();
    this.activeNode = null;
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
          onNodeSelected={this.props.onNodeSelected}
          onMount={this.index.add.bind(this.index)}
        />
      </Container>
    );
  }
}
