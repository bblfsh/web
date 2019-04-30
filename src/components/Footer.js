import React from 'react';
import ReactTooltip from 'react-tooltip';

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
      <span className="bblfsh-footer__padded_right">
        Babelfish server: {bblfshdVersion}. Web client: {webClientVersion}
      </span>{' '}
      <span
        className="bblfsh-footer__drivers_versions"
        data-tip="drivers versions"
      >
        Installed Drivers Versions
      </span>
      <ReactTooltip place="top" type="dark" effect="solid">
        {languageVersions}
      </ReactTooltip>
    </div>
  );
}

export default function Footer({ versionsState, languages }) {
  return (
    <div className="bblfsh-footer__container">
      <Versions versionsState={versionsState} languages={languages} />
      <span>
        Built with{' '}
        <a
          className="bblfsh-footer__link"
          href="https://github.com/bblfsh"
          target="_blank"
          rel="noopener noreferrer"
        >
          Babelfish
        </a>{' '}
        (see{' '}
        <a
          className="bblfsh-footer__link"
          href="https://doc.bblf.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          documentation
        </a>),{' '}
        <a
          className="bblfsh-footer__link"
          href="http://codemirror.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CodeMirror
        </a>, and{' '}
        <a
          className="bblfsh-footer__link"
          href="https://facebook.github.io/react"
          target="_blank"
          rel="noopener noreferrer"
        >
          React
        </a>{' '}
        under GPLv3 license. Fork{' '}
        <a
          className="bblfsh-footer__link"
          href="https://github.com/bblfsh/web/#fork-destination-box"
          target="_blank"
          rel="noopener noreferrer"
        >
          this demo
        </a>. Coded by{' '}
        <a
          className="bblfsh-footer__link"
          href="https://sourced.tech"
          target="_blank"
          rel="noopener noreferrer"
        >
          {'source{d}'}
        </a>.
      </span>
    </div>
  );
}
