import React from 'react';
import styled from 'styled-components';
import { background, border, font } from '../styling/variables';

const Container = styled.footer`
  padding: .5rem;
  font-size: .9rem;
  text-align: center;
  border-top: 1px solid ${border.smooth};
  background: ${background.light};
`;

const Link = styled.a`color: ${font.color.dark};`;

export default function Footer() {
  return (
    <Container>
      Built with{' '}
      <Link href="https://github.com/bblfsh" target="_blank">
        Babelfish
      </Link>{' '}
      (see{' '}
      <Link href="https://doc.bblf.sh" target="_blank">
        documentation
      </Link>),{' '}
      <Link href="http://codemirror.net/" target="_blank">
        CodeMirror
      </Link>, and{' '}
      <Link href="https://facebook.github.io/react" target="_blank">
        React
      </Link>{' '}
      under GPLv3 license. Fork{' '}
      <Link
        href="https://github.com/bblfsh/dashboard/#fork-destination-box"
        target="_blank"
      >
        this demo
      </Link>. Coded by{' '}
      <Link href="https://sourced.tech" target="_blank">
        {'source{d}'}
      </Link>.
    </Container>
  );
}
