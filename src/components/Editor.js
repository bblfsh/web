import React, { Component } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { connect } from 'react-redux';
import { getLanguageMode } from '../state/languages';
import { change as changeCode, selectNodeByPos } from '../state/code';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/php/php';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/mode/shell/shell';

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
        className: 'bblfsh-editor__mark',
      });
    } else if (from) {
      this.mark = this.document.setBookmark(from, { widget: this.bookmark });
    }
  }

  componentDidMount() {
    this.selectCode(this.props.markRange);
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
      <div className="bblfsh-editor__container">
        <CodeMirror
          ref={r => (this.codemirror = r)}
          autoFocus={true}
          value={code}
          options={options}
          onBeforeChange={(editor, data, v) => onChange(v)}
          onCursor={(_, pos) => this.onCursor(pos)}
        />
        <div
          className="bblfsh-editor__bookmark"
          ref={elem => {
            this.bookmark = elem;
          }}
        />
      </div>
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
