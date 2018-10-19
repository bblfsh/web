import React from 'react';
import { connect } from 'react-redux';
import { setParseMode } from '../state/options';
import { runParser } from '../state/code';

const modes = ['semantic', 'annotated', 'native'];

export function ParseModeSwitcher({ mode, onChange }) {
  return (
    <div style={{ padding: '20px' }}>
      {modes.map(m => (
        <label key={m} style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value={m}
            checked={mode === m}
            onChange={e => onChange(e.target.value)}
          />{' '}
          {m}
        </label>
      ))}
    </div>
  );
}

export default connect(
  state => ({ mode: state.options.parseMode }),
  dispatch => {
    return {
      onChange: v => {
        dispatch(setParseMode(v));
        dispatch(runParser());
      },
    };
  }
)(ParseModeSwitcher);
