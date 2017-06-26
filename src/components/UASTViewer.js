import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
`

export default class UASTViewer extends Component {
  selectNode({ line, ch }) {
    throw new Error("UASTViewer.selectNode not implemented yet");
  }

  render() {
    return (
      <Container>
        UASTViewer
      </Container>
    );
  }
}
