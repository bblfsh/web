import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import CodeMirror from 'react-codemirror';
import { background } from '../styling/variables';


import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';

// eslint-disable-next-line
injectGlobal`
  .ReactCodeMirror, .CodeMirror {
    height: 100%;
  }
`;

const Container = styled.div`height: 100%;`;

const BookMark = styled.div`
  display: inline-block;
  position: relative;
  width: 0;
  height: 0;

  &::before {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -2px;
    width: 3px;
    height: 19px;
    border: 1px solid #EA7024;
    border-right-width: 0 !important;
  }
`;

export default class Editor extends Component {
  get document() {
    return this.editor.getDoc();
  }

  get editor() {
    return this.refs.codemirror.getCodeMirror();
  }

  selectCode(from, to) {
    if (from && to) {
      return this.document.markText(from, to, {
        css: 'background: ' + background.highlight
      });
    } else if (from) {
      return this.document.setBookmark(from, { widget: this.bookmark });
    }
  }

  setMode(mode) {
    this.editor.setOption('mode', mode);
  }

  updateCode() {
    this.document.setValue(this.props.code);
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
    const { code, languageMode, onChange } = this.props;

    const options = {
      mode: languageMode,
      lineNumbers: true,
      theme: 'solarized light'
    };

    return (
      <Container>
        <CodeMirror
          ref="codemirror"
          autoFocus={true}
          onChange={onChange}
          value={code}
          onCursorActivity={editor => this.onCursorActivity(editor)}
          options={options}
        />
        <BookMark innerRef={elem => { this.bookmark = elem }} />
      </Container>
    );
  }
}
