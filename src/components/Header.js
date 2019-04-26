import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import log from '../services/log';
import {
  select as languageSelect,
  set as languageSet,
} from '../state/languages';
import { select as exampleSelect } from '../state/examples';
import { runParser } from '../state/code';
import { setURL as gistSetURL, load as gistLoad } from '../state/gist';
import { isUrl } from '../state/options';

import bblfshLogo from '../img/babelfish_logo.svg';
import githubIcon from '../img/github.svg';

export function DriverCode({ languages, selectedLanguage, actualLanguage }) {
  const driver = selectedLanguage === '' ? actualLanguage : selectedLanguage;

  return (
    <div className="bblfsh-header__driver-code-box">
      <a
        className="bblfsh-header__driver-code-link"
        href={languages[driver] && languages[driver].url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="bblfsh-header__driver-code-icon"
          src={githubIcon}
          alt="Driver code repository on GitHub"
          title="Driver code repository on GitHub"
        />
      </a>
    </div>
  );
}

export class Header extends Component {
  onShareGist(shared) {
    log.info('shared url:' + shared);
  }

  getSharableUrl() {
    return `${window.location.origin}${window.location.pathname}#${
      this.props.gist
    }`;
  }

  render() {
    const {
      selectedLanguage,
      actualLanguage,
      languages,
      examples,
      onLanguageChanged,
      onExampleChanged,
      onRunParser,
      parsing,
      selectedExample,
      canParse,
      gistURL,
      isValidGist,
      updateGistUrl,
      onTryLoadingGist,
    } = this.props;

    const languageOptions = Object.keys(languages).map(k => {
      let name = languages[k].name;
      if (
        k === '' &&
        !selectedLanguage &&
        actualLanguage &&
        languages[actualLanguage]
      ) {
        name = `auto (${languages[actualLanguage].name})`;
      }

      return (
        <option value={k} key={k}>
          {name}
        </option>
      );
    });

    const examplesOptions = [
      <option value="" key="">
        ---
      </option>,
      Object.keys(examples).map((key, k) => (
        <option value={key} key={k}>
          {examples[key].name}
        </option>
      )),
    ];

    return (
      <header className="bblfsh-header__container">
        <h1 className="bblfsh-header__title">
          <img
            className="bblfsh-header__title-image"
            src={bblfshLogo}
            alt="bblfsh"
          />
          <span className="bblfsh-header__app-title">Web</span>
        </h1>

        <div className="bblfsh-header__actions">
          <div className="bblfsh-header__input-group">
            <label className="bblfsh-header__label" htmlFor="language-selector">
              Language
            </label>
            <select
              className="bblfsh-header__select"
              id="language-selector"
              onChange={e => onLanguageChanged(e.target.value)}
              value={selectedLanguage}
            >
              {languageOptions}
            </select>

            <DriverCode
              languages={languages}
              selectedLanguage={selectedLanguage}
              actualLanguage={actualLanguage}
            />
          </div>

          <div className="bblfsh-header__input-group">
            <label className="bblfsh-header__label" htmlFor="examples-selector">
              Examples
            </label>
            <select
              className="bblfsh-header__select"
              id="examples-selector"
              onChange={e => onExampleChanged(e.target.value)}
              value={selectedExample}
            >
              {examplesOptions}
            </select>
          </div>

          <div className="bblfsh-header__input-group">
            <input
              className="bblfsh-header__input"
              type="url"
              value={gistURL}
              onChange={e => updateGistUrl(e.target.value)}
              placeholder="raw gist url"
            />
            <button
              className="bblfsh-header__button"
              onClick={onTryLoadingGist}
              disabled={!isValidGist}
            >
              load
            </button>
            <CopyToClipboard
              text={this.getSharableUrl()}
              onCopy={shared => this.onShareGist(shared)}
            >
              <button className="bblfsh-header__button" disabled={!isValidGist}>
                share
              </button>
            </CopyToClipboard>
          </div>

          <div className="bblfsh-header__input-group right">
            <button
              className="bblfsh-header__run-button"
              id="run-parser"
              onClick={onRunParser}
              disabled={!canParse}
            >
              {parsing ? 'Parsing...' : 'Run parser'}
            </button>
          </div>
        </div>
      </header>
    );
  }
}

export const mapStateToProps = state => {
  const { languages, examples, options, code, gist } = state;
  const validServerUrl = isUrl(options.customServerUrl);

  return {
    languages: languages.languages,
    selectedLanguage: languages.selected,
    actualLanguage: languages.actual,

    selectedExample: examples.selected,
    examples: examples.list,

    parsing: code.parsing,
    canParse:
      !languages.loading &&
      !code.parsing &&
      (validServerUrl || !options.customServer) &&
      !!code.code,

    gistURL: gist.url,
    gist: gist.gist,
    isValidGist: gist.isValid,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLanguageChanged: lang => {
      dispatch(languageSelect(lang));
    },
    onExampleChanged: key => {
      dispatch(exampleSelect(key));
      dispatch(runParser());
    },
    onRunParser: () => dispatch(runParser()),
    updateGistUrl: url => dispatch(gistSetURL(url)),
    onTryLoadingGist: () => {
      dispatch(gistLoad())
        .then(() => {
          // reset selected language to allow babelfish server recognize it
          dispatch(languageSet(''));
          dispatch(languageSelect(''));
          dispatch(runParser());
        })
        .catch(() => log.error('can not load gist'));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
