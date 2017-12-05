import React, { Component } from 'react';
import styled from 'styled-components';
import 'normalize.css';
import SplitPane from 'react-split-pane';

import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Editor from './components/Editor';
import Options from './components/Options';
import UASTViewer from './components/UASTViewer';
import { Notifications, Error } from './components/Notifications';
import { indexDrivers } from './drivers';
import * as history from './services/history';
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
    code: java_example_1,
  },
  java_example_2: {
    name: 'swap.java',
    language: LANG_JAVA,
    code: java_example_2,
  },
  python_example_1: {
    name: 'fizzbuzz.py',
    language: LANG_PYTHON,
    code: python_example_1,
  },
  python_example_2: {
    name: 'classdef.py',
    language: LANG_PYTHON,
    code: python_example_2,
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

  history.setExample();

  return {
    ...getResetCodeState(example.code, example.name),
    // babelfish tells us which language is active at the moment, but it
    // won't be used unless the selectedLanguage is auto.
    actualLanguage: example.language,
    // this is the language that is selected by the user. It overrides the
    // actualLanguage except when it is 'auto'.
    selectedLanguage: 'auto',
    selectedExample: key,
  };
}

function getGistState(content, gistUrl, selectedLanguage) {
  const gistParts = gistUrl.split('/');
  const filename = gistParts[gistParts.length - 1];
  const state = {
    ...getResetCodeState(content, filename),
    cleanGist: true,
    gistUrl,
  };

  if (selectedLanguage) {
    state.selectedLanguage = selectedLanguage;
    history.setLanguage(selectedLanguage);
  }

  history.setGist(gistUrl);

  return state;
}

function getInitialState() {
  return {
    showLocations: false,
    customServer: false,
    customServerUrl: '',
    languages: {
      auto: { name: '(auto)' },
    },
    filename: undefined,
    code: null,
    ast: {},

    gistUrl: undefined,
  };
}

function getResetCodeState(code, filename, selectedLanguage) {
  return {
    code: code || null,
    ast: {},
    dirty: true,
    cleanGist: false,
    loading: false,
    errors: [],

    filename,
    actualLanguage: '',
    selectedLanguage: selectedLanguage || 'auto',
    selectedExample: '',
  };
}

export default class App extends Component {
  constructor(props) {
    super(props);
    const { gistUrl } = history.parse();
    const codeState = gistUrl
      ? getResetCodeState()
      : getExampleState(DEFAULT_EXAMPLE);
    this.state = Object.assign(getInitialState(), codeState);
    this.mark = null;
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.loaded = api
      .listDrivers()
      .then(indexDrivers)
      .then(languages =>
        this.setState(
          {
            loading: false,
            languages: Object.assign(this.state.languages, languages),
          },
          this.onRunParser
        )
      )
      .catch(err => {
        console.error(err);
        this.setState({
          loading: false,
          errors: ['Unable to load the list of available drivers.'],
        });
      });

    if (this.state.code === null) {
      const { gistUrl, lang } = history.parse();
      this.onGistLoaded(gistUrl, lang);
    }
  }

  componentDidUpdate() {
    if (!this.editor) {
      return;
    }
    this.editor.setMode(this.languageMode);
    this.editor.updateCode();
  }

  onLanguageChanged(language) {
    let selectedLanguage = language;
    if (!this.hasLanguage(selectedLanguage)) {
      selectedLanguage = 'auto';
    }
    this.setState({ selectedLanguage }, this.onRunParser);

    history.setLanguage(selectedLanguage);
  }

  onExampleChanged(exampleKey) {
    this.clearNodeSelection();
    if (!exampleKey) {
      return;
    }
    this.setState(getExampleState(exampleKey), this.onRunParser);
  }

  hasLanguage(lang) {
    return this.state.languages.hasOwnProperty(lang);
  }

  onRunParser() {
    const { code, filename, customServer, customServerUrl } = this.state;
    this.setState({ loading: true, errors: [] });
    api
      .parse(
        this.currentLanguage,
        filename,
        code,
        customServer ? customServerUrl : undefined
      )
      .then(
        ({ uast, language }) => {
          this.setState({
            loading: false,
            ast: uast || {},
            actualLanguage: language,
          });
        },
        errors => this.setState({ loading: false, errors })
      );
  }

  onErrorRemoved(idx) {
    this.setState({
      errors: this.state.errors.filter((_, i) => i !== idx),
    });
  }

  onNodeSelected(from, to) {
    if (this.mark) {
      this.mark.clear();
    }

    this.mark = this.editor.selectCode(from, to);
  }

  clearNodeSelection() {
    if (this.mark) {
      this.mark.clear();
      this.mark = null;
    }
  }

  onCursorChanged(pos) {
    if (!this.viewer || !this.state.ast) {
      return;
    }

    this.viewer.selectNode(pos);
  }

  onCodeChange(code) {
    this.setState({ code, dirty: true, cleanGist: false });
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
      customServerUrl: this.state.customServer ? '' : '0.0.0.0:9432',
    });
  }

  onCustomServerUrlChange(customServerUrl) {
    this.setState({ customServerUrl });
  }

  onGistLoaded(gistUrl, selectedLanguage) {
    api
      .getGist(gistUrl)
      .then(content => {
        this.setState(
          getGistState(content, gistUrl, selectedLanguage),
          this.onRunParser
        );
      })
      .catch(errors => this.setState({ errors }));
  }

  renderContent() {
    const { innerWidth: width } = window;
    const {
      code,
      ast,
      loading,
      showLocations,
      customServer,
      customServerUrl,
    } = this.state;

    const validServerUrl = isUrl(customServerUrl);

    return (
      <SplitPane
        split="vertical"
        minSize={width * 0.25}
        defaultSize="50%"
        maxSize={width * 0.75}
      >
        <Editor
          ref={r => (this.editor = r)}
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
              this.onCustomServerUrlChange(e.target.value)
            }
          />
          <UASTViewer
            ref={r => (this.viewer = r)}
            clearNodeSelection={() => this.clearNodeSelection()}
            onNodeSelected={(from, to) => this.onNodeSelected(from, to)}
            ast={ast}
            showLocations={showLocations}
            loading={loading}
          />
        </RightPanel>
      </SplitPane>
    );
  }

  render() {
    const {
      languages,
      selectedLanguage,
      selectedExample,
      code,
      loading,
      actualLanguage,
      dirty,
      gistUrl,
      cleanGist,
      errors,
      customServer,
      customServerUrl,
    } = this.state;

    const validServerUrl = isUrl(customServerUrl);

    return (
      <Wrap>
        <Header
          languages={languages}
          selectedLanguage={selectedLanguage}
          actualLanguage={actualLanguage}
          onLanguageChanged={e => this.onLanguageChanged(e.target.value)}
          selectedExample={selectedExample}
          onExampleChanged={e => this.onExampleChanged(e.target.value)}
          onRunParser={e => this.onRunParser(e)}
          examples={examples}
          loading={loading}
          canParse={!loading && (validServerUrl || !customServer) && dirty}
          gistUrl={gistUrl}
          cleanGist={cleanGist}
          onLoadGist={url => this.onGistLoaded(url)}
        />
        <Content>{code !== null ? this.renderContent() : <Spinner />}</Content>

        <Footer />

        {errors.length > 0 ? (
          <Notifications>
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
        ) : null}
      </Wrap>
    );
  }
}

const isUrl = url => /^[a-zA-Z0-9][^/]+$/.test(url);
