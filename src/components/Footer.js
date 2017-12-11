import React from 'react';
import styled from 'styled-components';
import { background, border, font } from '../styling/variables';

const Container = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  font-size: 0.9rem;
  border-top: 1px solid ${border.smooth};
  background: ${background.light};
`;

const Link = styled.a`
  color: ${font.color.dark};
`;

export function Versions({ loading, error, bblfshdVersion, dashboardVersion }) {
  if (loading) {
    return <span>Getting server version...</span>;
  }

  if (error) {
    return <span>{error}</span>;
  }

  return (
    <span>
      Babelfish server: {bblfshdVersion}. Dashboard: {dashboardVersion}
    </span>
  );
}

export default function Footer({ versionsState }) {
  return (
    <Container>
      <Versions {...versionsState} />
      <span>
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
      </span>
    </Container>
  );
}
