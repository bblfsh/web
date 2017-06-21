import React, { Component } from 'react';
import styled from 'styled-components';
import 'normalize.css';
import SplitPane from 'react-split-pane';

import Header from './components/Header';
import Editor from './components/Editor';
import UASTViewer from './components/UASTViewer';

const Wrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row;
`

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { innerWidth: width } = window;

    return (
      <Wrap>
        <Header />
        <Content>
          <SplitPane split='vertical' minSize={width * 0.25} defaultSize='50%' maxSize={width * 0.75}>
            <Editor />
            <UASTViewer />
          </SplitPane>
        </Content>
      </Wrap>
    );
  }
}

