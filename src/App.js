import React, { Component } from 'react';
import styled from 'styled-components';
import 'normalize.css';
import SplitPane from 'react-split-pane';

import Header from './components/Header';
import Footer from './components/Footer';
import Editor from './components/Editor';
import Options from './components/Options';
import UASTViewer from './components/UASTViewer';
import { Notifications, Error } from './components/Notifications';
import { indexDrivers } from './drivers';
import * as api from './services/api';

import { java_example_1 } from './examples/hello.java.js';
import { java_example_2 } from './examples/swap.java.js';
import { python_example_1 } from './examples/fizzbuzz.py.js';
import { python_example_2 } from './examples/classdef.py.js';

const DEFAULT_EXAMPLE = 'java_example_1';
const LANG_JAVA = 'java';
const LANG_PYTHON = 'python';

const examples = {
  java_example_1: {
    name: 'hello.java',
    language: LANG_JAVA,
    code: java_example_1
  },
  java_example_2: {
    name: 'swap.java',
    language: LANG_JAVA,
    code: java_example_2
  },
  python_example_1: {
    name: 'fizzbuzz.py',
    language: LANG_PYTHON,
    code: python_example_1
  },
  python_example_2: {
    name: 'classdef.py',
    language: LANG_PYTHON,
    code: python_example_2
  },
};

const Wrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  height: 100%;
  flex-direction: row;
  position: relative;
`;

const RightPanel = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  position: relative;
`;

function getExampleState(key) {
  const example = examples[key];

  return {
    ...getResetCodeState(examples[key].code),
    languages: {
      auto: { name: '(auto)' }
    },
    // babelfish tells us which language is active at the moment, but it
    // won't be used unless the selectedLanguage is auto.
    actualLanguage: example.language,
    // this is the language that is selected by the user. It overrides the
    // actualLanguage except when it is 'auto'.
    selectedLanguage: 'auto',
    selectedExample: example.language,
  };
}

function getInitialState() {
  return {
    showLocations: false,
    customServer: false,
    customServerUrl: '',
  };
}

function getResetCodeState(code) {
  return {
    code,
    ast: {},
    dirty: true,
    loading: false,
    errors: []
  };
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign(getInitialState(), getExampleState(DEFAULT_EXAMPLE));
    this.mark = null;
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.loaded = api
      .listDrivers()
      .then(indexDrivers)
      .then(languages =>
        this.setState({
          loading: false,
          languages: Object.assign(this.state.languages, languages)
        }, this.onRunParser)
      )
      .catch(err => {
        console.error(err);
        this.setState({
          loading: false,
          errors: ['Unable to load the list of available drivers.']
        });
      });
  }

  componentDidUpdate() {
    this.refs.editor.setMode(this.languageMode);
    this.refs.editor.updateCode();
  }

  onLanguageChanged(language) {
    let selectedLanguage = language;
    if (!this.hasLanguage(selectedLanguage)) {
      selectedLanguage = 'auto';
    }
    this.setState({ selectedLanguage }, this.onRunParser);
  }

  onExampleChanged(exampleKey) {
    this.clearNodeSelection();
    const { languages } = this.state;
    this.setState({ ...getExampleState(exampleKey), languages }, this.onRunParser);
  }

  hasLanguage(lang) {
    return this.state.languages.hasOwnProperty(lang);
  }

  onRunParser() {
    const { code, customServer, customServerUrl } = this.state;
    this.setState({ loading: true, errors: [] });
    api
      .parse(
        this.currentLanguage,
        code,
        customServer ? customServerUrl : undefined
      )
      .then(
        ast => this.setState({ loading: false, ast }),
        errors => this.setState({ loading: false, errors })
      );
  }

  onErrorRemoved(idx) {
    this.setState({
      errors: this.state.errors.filter((_, i) => i !== idx)
    });
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
      this.mark = null;
    }
  }

  onCursorChanged(pos) {
    if (!this.refs.viewer || !this.state.ast) {
      return;
    }

    this.refs.viewer.selectNode(pos);
  }

  onCodeChange(code) {
    this.setState({ code, dirty: true });
  }

  get currentLanguage() {
    let { selectedLanguage, actualLanguage } = this.state;

    if (selectedLanguage === 'auto') {
      selectedLanguage = actualLanguage;
    }

    return selectedLanguage;
  }

  get languageMode() {
    if (this.state.languages[this.currentLanguage]) {
      return this.state.languages[this.currentLanguage].mode;
    }

    return '';
  }

  onLocationsToggle() {
    this.setState({ showLocations: !this.state.showLocations });
  }

  onCustomServerToggle() {
    this.setState({
      customServer: !this.state.customServer,
      customServerUrl: this.state.customServer ? '' : '0.0.0.0:9432'
    });
  }

  onCustomServerUrlChange(customServerUrl) {
    this.setState({ customServerUrl });
  }

  onGistLoaded(gistUrl) {
    api.getGist(gistUrl)
      .then(content => {
        this.setState({...getResetCodeState(content)});
      })
      .catch(errors => this.setState({ errors }));
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
      errors,
      showLocations,
      customServer,
      customServerUrl
    } = this.state;

    const validServerUrl = isUrl(customServerUrl);

    return (
      <Wrap>
        <Header
          languages={languages}
          selectedLanguage={selectedLanguage}
          actualLanguage={actualLanguage}
          onLanguageChanged={e => this.onLanguageChanged(e.target.value)}
          onExampleChanged={e => this.onExampleChanged(e.target.value)}
          onRunParser={e => this.onRunParser(e)}
          examples={examples}
          loading={loading}
          canParse={!loading && (validServerUrl || !customServer) && dirty}
          onLoadGist={(url) => this.onGistLoaded(url)}
        />
        <Content>
          <SplitPane
            split="vertical"
            minSize={width * 0.25}
            defaultSize="50%"
            maxSize={width * 0.75}
          >
            <Editor
              ref="editor"
              code={code}
              languageMode={this.languageMode}
              onChange={code => this.onCodeChange(code)}
              onCursorChanged={pos => this.onCursorChanged(pos)}
            />

            <RightPanel>
              <Options
                showLocations={showLocations}
                customServer={customServer}
                customServerUrl={customServerUrl}
                serverUrlIsValid={validServerUrl}
                onLocationsToggle={() => this.onLocationsToggle()}
                onCustomServerToggle={() => this.onCustomServerToggle()}
                onCustomServerUrlChange={e =>
                  this.onCustomServerUrlChange(e.target.value)}
              />
              <UASTViewer
                ref="viewer"
                clearNodeSelection={() => this.clearNodeSelection()}
                onNodeSelected={(from, to) => this.onNodeSelected(from, to)}
                ast={ast}
                showLocations={showLocations}
                loading={loading}
              />
            </RightPanel>
          </SplitPane>
        </Content>

        <Footer />

        {errors.length > 0
          ? <Notifications>
              {errors.map((err, i) => {
                return (
                  <Error
                    message={err}
                    key={i}
                    onRemove={() => this.onErrorRemoved(i)}
                  />
                );
              })}
            </Notifications>
          : null}
      </Wrap>
    );
  }
}

const isUrl = url => /^[a-zA-Z0-9][^/]+$/.test(url);
