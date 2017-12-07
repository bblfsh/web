import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { background } from '../styling/variables';
import { font, border } from '../styling/variables';
import { connect } from 'react-redux';
import { getLanguageMode } from 'state/languages';
import { change as changeCode, selectNodeByPos } from 'state/code';

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

export class Editor extends Component {
  get document() {
    return this.editor.getDoc();
  }

  get editor() {
    return this.codemirror.editor;
  }

  selectCode(range) {
    if (this.mark) {
      this.mark.clear();
    }

    if (!range) {
      this.mark = null;
      return;
    }

    const { from, to } = range;

    if (from && to) {
      this.mark = this.document.markText(from, to, {
        css: 'background: ' + background.highlight,
      });
    } else if (from) {
      this.mark = this.document.setBookmark(from, { widget: this.bookmark });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markRange !== this.props.markRange) {
      this.selectCode(this.props.markRange);
    }
  }

  onCursor(pos) {
    if (!this.props.onCursorChanged) {
      return;
    }

    this.props.onCursorChanged(pos);
  }

  render() {
    const { code, languageMode, onChange } = this.props;

    const options = {
      mode: languageMode,
      lineNumbers: true,
      theme: 'solarized light',
    };

    return (
      <Container>
        <CodeMirror
          ref={r => (this.codemirror = r)}
          autoFocus={true}
          value={code}
          options={options}
          onBeforeChange={(editor, data, v) => onChange(v)}
          onCursor={(_, pos) => this.onCursor(pos)}
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

export const mapStateToProps = state => {
  return {
    code: state.code.code,
    languageMode: getLanguageMode(state),
    markRange: state.code.markRange,
  };
};

const mapDispatchToProps = {
  onChange: changeCode,
  onCursorChanged: selectNodeByPos,
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
