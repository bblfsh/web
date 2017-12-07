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
import * as history from './services/history';
import * as api from './services/api';
import { connect } from 'react-redux';
import { remove as errorsRemove } from 'state/errors';
import { init } from 'state';

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

export class App extends Component {
  componentDidMount() {
    return this.props.init();
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

    return (
      <SplitPane
        split="vertical"
        minSize={width * 0.25}
        defaultSize="50%"
        maxSize={width * 0.75}
      >
        <Editor />

        <RightPanel>
          <Options />
          <UASTViewer />
        </RightPanel>
      </SplitPane>
    );
  }

  render() {
    const { code, errors, errorsRemove } = this.props;

    return (
      <Wrap>
        <Header />
        <Content>{code !== null ? this.renderContent() : <Spinner />}</Content>

        <Footer />

        {errors.length > 0 ? (
          <Notifications>
            {errors.map((err, i) => {
              return (
                <Error message={err} key={i} onRemove={() => errorsRemove(i)} />
              );
            })}
          </Notifications>
        ) : null}
      </Wrap>
    );
  }
}

const mapStateToProps = state => ({
  languages: state.languages,
  code: state.code.code,
  errors: state.errors,
});

const mapDispatchToProps = {
  init,
  errorsRemove,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
