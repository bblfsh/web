import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import { withUASTEditor, Editor } from 'uast-viewer';
import 'uast-viewer/dist/default-theme.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Options from './components/Options';
import SearchPanel from './components/SearchPanel';
import ParseModeSwitcher from './components/ParseModeSwitcher';
import UASTViewer from './components/UASTViewer';
import { Notifications, Error } from './components/Notifications';
import { connect } from 'react-redux';
import { remove as errorsRemove } from './state/errors';
import { init } from './state';
import { getLanguageMode } from './state/languages';
import { change as changeCode } from './state/code';

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

        <div className="bblfsh-app__right-panel">
          <Options />
          <SearchPanel />
          <ParseModeSwitcher />
          <UASTViewer
            uastViewerProps={uastViewerProps}
            showLocations={showLocation}
          />
        </div>
      </SplitPane>
    );
  }

  render() {
    const { code, errors, versions, errorsRemove, languages } = this.props;
    let langList = {};
    if (languages !== undefined) {
      langList = languages.languages;
    }

    return (
      <div className="bblfsh-app__wrap">
        <Header />
        <div className="bblfsh-app__content">
          {code !== null ? this.renderContent() : <Spinner />}
        </div>

        <Footer versionsState={versions} languages={langList} />

        {errors.length > 0 ? (
          <Notifications>
            {errors.map((err, i) => {
              return (
                <Error
                  message={err.message}
                  key={i}
                  onRemove={() => errorsRemove(i)}
                />
              );
            })}
          </Notifications>
        ) : null}
      </div>
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
  withUASTEditor(App)
);
