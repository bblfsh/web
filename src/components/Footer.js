import React from 'react';
import styled from 'styled-components';
import { background, border, font } from '../styling/variables';
import ReactTooltip from 'react-tooltip';

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

const PaddedRight = styled.span`
  padding-right: 40px;
`;

const DriversVersions = styled.span`
  white-space: nowrap;
  border-bottom: 1px dashed;
`;

export function Versions({ versionsState, languages }) {
  const { loading, error, bblfshdVersion, webClientVersion } = versionsState;

  if (loading) {
    return <span>Getting server version...</span>;
  }

  if (error) {
    return <span>{error}</span>;
  }

  const languageVersions = Object.keys(languages).reduce((acc, k) => {
    // language entry for '': { name: '(auto)' }
    if (k === '') {
      return acc;
    }

    const { version, name } = languages[k];

    acc.push(
      <span key={k}>
        {name} {version}
        <br />
      </span>
    );

    return acc;
  }, []);

  return (
    <div>
      <PaddedRight>
        Babelfish server: {bblfshdVersion}. Web client: {webClientVersion}
      </PaddedRight>{' '}
      <DriversVersions data-tip="drivers versions">
        Installed Drivers Versions
      </DriversVersions>
      <ReactTooltip place="top" type="dark" effect="solid">
        {languageVersions}
      </ReactTooltip>
    </div>
  );
}

export default function Footer({ versionsState, languages }) {
  return (
    <Container>
      <Versions versionsState={versionsState} languages={languages} />
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
          href="https://github.com/bblfsh/web/#fork-destination-box"
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
