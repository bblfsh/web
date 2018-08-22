import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import 'normalize.css';
import SplitPane from 'react-split-pane';
import { withUASTEditor, Editor } from 'uast-viewer';
import { hocOptions } from 'uast-viewer/es/uast-v2';
import 'uast-viewer/dist/default-theme.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Options from './components/Options';
import SearchPanel from './components/SearchPanel';
import UASTViewer from './components/UASTViewer';
import { Notifications, Error } from './components/Notifications';
import { connect } from 'react-redux';
import { remove as errorsRemove } from './state/errors';
import { init } from './state';
import { getLanguageMode } from './state/languages';
import { change as changeCode } from './state/code';

import { font } from './styling/variables';

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

// eslint-disable-next-line
injectGlobal`
  .ReactCodeMirror, .CodeMirror {
    height: 100%;
  }

  .CodeMirror {
    font-family: ${font.family.code};
    font-size: ${font.size.large};
  }
`;

export class App extends Component {
  componentDidMount() {
    return this.props.init();
  }

  renderContent() {
    const {
      editorProps,
      uastViewerProps,
      codeIsDirty,
      showLocation,
      changeCode,
    } = this.props;
    const { innerWidth: width } = window;

    // disable highlighting if code doesn't match UAST
    if (codeIsDirty) {
      editorProps.markRange = null;
    }

    return (
      <SplitPane
        split="vertical"
        minSize={width * 0.25}
        defaultSize="50%"
        maxSize={width * 0.75}
      >
        <Editor
          {...editorProps}
          onChange={changeCode}
          style={{ height: '100%' }}
        />

        <RightPanel>
          <Options />
          <SearchPanel />
          <UASTViewer
            uastViewerProps={uastViewerProps}
            showLocations={showLocation}
          />
        </RightPanel>
      </SplitPane>
    );
  }

  render() {
    const { code, errors, versions, errorsRemove } = this.props;

    return (
      <Wrap>
        <Header />
        <Content>{code !== null ? this.renderContent() : <Spinner />}</Content>

        <Footer versionsState={versions} />

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
  code: state.code.code || '',
  codeIsDirty: state.code.dirty,
  languageMode: getLanguageMode(state),
  uast: state.code.uastJson,
  showLocation: state.options.showLocations,
  errors: state.errors,
  versions: state.versions,
});

const mapDispatchToProps = {
  init,
  errorsRemove,
  changeCode,
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withUASTEditor(App, hocOptions)
);
