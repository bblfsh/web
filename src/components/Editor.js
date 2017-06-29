import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import CodeMirror from 'react-codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';

// eslint-disable-next-line
injectGlobal`
  .ReactCodeMirror, .CodeMirror {
    height: 100%;
  }
`

const Container = styled.div`
  height: 100%;
`

export default class Editor extends Component {
  get document() {
    return this.editor.getDoc();
  }

  get editor() {
    return this.refs.codemirror.getCodeMirror();
  }

  selectCode(from, to) {
    return this.document.markText(from, to, {
      css: 'background: yellow',
    });
  }

  setMode(mode) {
    this.editor.setOption('mode', mode);
  }

  onCursorActivity(editor) {
    if (!this.props.onCursorChanged) {
      return;
    }

    const doc = editor.getDoc();
    const selection = doc.listSelections().slice(0, 1).pop();
    this.props.onCursorChanged(selection.head);
  }

  render() {
    const {
      code,
      languageMode,
      onChange,
    } = this.props;

    const options = {
      mode: languageMode,
      lineNumbers: true,
      theme: 'solarized light',
    };

    return (
      <Container>
        <CodeMirror
          ref='codemirror'
          autoFocus={true}
          onChange={onChange}
          value={code}
          onCursorActivity={editor => this.onCursorActivity(editor)}
          options={options} />
      </Container>
    );
  }
}
