import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
`

export default class UASTViewer extends Component {
  selectNodes(start, end) {
    throw new Error("UASTViewer.selectNodes not implemented yet");
  }

  render() {
    return (
      <Container>
        UASTViewer
      </Container>
    );
  }
}
