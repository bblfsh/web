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
  // babelfish tells us which language is active at the moment, but it
  // won't be used unless the selectedLanguage is auto.
  actualLanguage: 'python',
  loading: false,
  // this is the language that is selected by the user. It overrides the
  // actualLanguage except when it is 'auto'.
  selectedLanguage: 'auto',
  code: '',
  ast: undefined,
  dirty: false,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
    this.mark = null;
  }

  componentDidUpdate() {
    this.refs.editor.setMode(this.languageMode);
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
    if (this.mark) {
      this.mark.clear();
    }

    this.mark = this.refs.editor.selectCode(from, to);
  }

  clearNodeSelection() {
    if (this.mark) {
      this.mark.clear();
    }
  }

  onCursorChanged(pos) {
    this.refs.viewer.selectNode(pos);
  }

  onCodeChange(code) {
    this.setState({ code, dirty: true });
  }

  get languageMode() {
    let { selectedLanguage, actualLanguage } = this.state;

    if (selectedLanguage === 'auto') {
      selectedLanguage = actualLanguage;
    }

    return this.state.languages[selectedLanguage].mode;
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
      dirty,
    } = this.state;

    return (
      <Wrap>
        <Header
          languages={languages}
          selectedLanguage={selectedLanguage}
          actualLanguage={actualLanguage}
          onLanguageChanged={e => this.onLanguageChanged(e)}
          onRunParser={e => this.onRunParser(e)}
          dirty={dirty}
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
              languageMode={this.languageMode}
              onChange={code => this.onCodeChange(code)}
              onCursorChanged={pos => this.onCursorChanged(pos)} />

            <UASTViewer 
              ref='viewer'
              clearNodeSelection={() => this.clearNodeSelection()}
              onNodeSelected={(from, to) => this.onNodeSelected(from, to)}
              ast={ast}
              loading={loading} />
          </SplitPane>
        </Content>
      </Wrap>
    );
  }
}
