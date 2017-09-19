import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import CodeMirror from 'react-codemirror';
import { background } from '../styling/variables';
import { font, border } from '../styling/variables';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';

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

const Container = styled.div`
  height: 100%;
`;

const BookMark = styled.div`
  display: inline-block;
  position: relative;
  width: 0;
  height: 0;

  &::before {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -3px;
    width: 3px;
    height: 19px;
    border: 1px solid ${border.accent};
    border-right-width: 0 !important;
    border-left-width: 2px !important;
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
    const cursor = this.cursor();
    this.document.setValue(this.props.code);
    this.document.setCursor(cursor);
  }

  onCursorActivity(editor) {
    if (!this.props.onCursorChanged) {
      return;
    }

    this.props.onCursorChanged(this.cursor(editor));
  }

  cursor(editor = this.editor) {
    return editor.getDoc().listSelections().slice(0, 1).pop().head;
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
        <BookMark
          innerRef={elem => {
            this.bookmark = elem;
          }}
        />
      </Container>
    );
  }
}
