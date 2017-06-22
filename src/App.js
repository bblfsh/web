import React, { Component } from 'react';
import styled from 'styled-components';
import 'normalize.css';
import SplitPane from 'react-split-pane';

import Header from './components/Header';
import Editor from './components/Editor';
import UASTViewer from './components/UASTViewer';
import languages from './languages';

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
  languages: Object.assign({
    auto: { name: '(auto)' },
  }, languages),
  actualLanguage: 'java',
  loading: false,
  selectedLanguage: 'auto',
  code: '',
  ast: undefined,
  userHasTyped: false,
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

  onNodeSelected(from, to) {
    this.refs.editor.selectCode(from, to);
  }

  onCursorChanged(editor) {
    // TODO
  }

  onCodeChange(code) {
    this.setState({ code, userHasTyped: true });
  }

  render() {
    const { innerWidth: width } = window;
    const { 
      languages, 
      selectedLanguage, 
      code, 
      ast, 
      loading, 
      actualLanguage,
      userHasTyped,
    } = this.state;

    return (
      <Wrap>
        <Header
          languages={languages}
          selectedLanguage={selectedLanguage}
          actualLanguage={actualLanguage}
          onLanguageChanged={e => this.onLanguageChanged(e)}
          onRunParser={e => this.onRunParser(e)}
          userHasTyped={userHasTyped}
          loading={loading} />

        <Content>
          <SplitPane 
            split='vertical' 
            minSize={width * 0.25} 
            defaultSize='50%' 
            maxSize={width * 0.75}>

            <Editor
              ref='editor'
              code={code}
              languageMode={languages[actualLanguage].mode}
              onChange={code => this.onCodeChange(code)}
              onCursorChanged={editor => this.onCursorChanged(editor)} />

            <UASTViewer 
              onNodeSelected={(from, to) => this.onNodeSelected(from, to)}
              ast={ast}
              loading={loading} />
          </SplitPane>
        </Content>
      </Wrap>
    );
  }
}

