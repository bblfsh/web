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
  position: relative;
`

const initialState = {
  languages: {
    auto: { name: '(auto)' },
    python: {
      name: 'Python',
      url: '#',
    },
    java: {
      name: 'Java',
      url: '#',
    },
  },
  actualLanguage: 'python',
  loading: false,
  selectedLanguage: 'auto',
  code: '',
  ast: undefined,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
  }

  onLanguageChanged(e) {
    let selectedLanguage = e.target.value;
    if (!this.state.languages.hasOwnProperty(selectedLanguage)) {
      selectedLanguage = 'auto';
    }
    this.setState({ selectedLanguage });
  }

  onRunParser(e) {
    throw new Error('run parser not implemented yet!');
  }

  render() {
    const { innerWidth: width } = window;
    const { languages, selectedLanguage, code, ast, loading, actualLanguage } = this.state;

    return (
      <Wrap>
        <Header
          languages={languages}
          selectedLanguage={selectedLanguage}
          actualLanguage={actualLanguage}
          onLanguageChanged={e => this.onLanguageChanged(e)}
          onRunParser={e => this.onRunParser(e)}
          loading={loading} />

        <Content>
          <SplitPane 
            split='vertical' 
            minSize={width * 0.25} 
            defaultSize='50%' 
            maxSize={width * 0.75}>

            <Editor
              code={code}
              loading={loading} />

            <UASTViewer 
              ast={ast}
              loading={loading} />
          </SplitPane>
        </Content>
      </Wrap>
    );
  }
}

