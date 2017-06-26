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
  flex-direction: row;
  position: relative;
  height: 100%;
`

const initialState = {
  languages: Object.assign({
    auto: { name: '(auto)' },
  }, languages),
  // babelfish tells us which language is active at the moment, but it
  // won't be used unless the selectedLanguage is auto.
  actualLanguage: 'python',
  loading: false,
  // this is the language that is selected by the user. It overrides the
  // actualLanguage except when it is 'auto'.
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
    if (!this.hasLanguage(selectedLanguage)) {
      selectedLanguage = 'auto';
    }
    this.setState({ selectedLanguage });
  }

  hasLanguage(lang) {
    return this.state.languages.hasOwnProperty(lang);
  }

  onRunParser(e) {
    throw new Error('run parser not implemented yet!');
  }

  onNodeSelected(from, to) {
    return this.refs.editor.selectCode(from, to);
  }

  onCursorChanged(start, end) {
    this.refs.viewer.selectNodes(start, end);
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
              ref='viewer'
              onNodeSelected={(from, to) => this.onNodeSelected(from, to)}
              ast={ast}
              loading={loading} />
          </SplitPane>
        </Content>
      </Wrap>
    );
  }
}
