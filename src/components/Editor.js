import React from 'react';
import styled, { injectGlobal } from 'styled-components';
import CodeMirror from 'react-codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

// eslint-disable-next-line
injectGlobal`
  .ReactCodeMirror, .CodeMirror {
    height: 100%;
  }
`

const Container = styled.div`
  width: 50%;
`

export default function Editor() {
  return (
    <Container>
      <CodeMirror options={{
        mode: 'python',
        lineNumbers: true,
      }} />
    </Container>
  );
}
