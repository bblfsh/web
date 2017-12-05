import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import CopyToClipboard from 'react-copy-to-clipboard';
import { shadow, font, background, border } from '../styling/variables';

import bblfshLogo from '../img/babelfish_logo.svg';
import githubIcon from '../img/github.svg';

const Container = styled.header`
  height: 70px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  background: ${background.light};
  border-bottom: 1px solid ${border.smooth};
  z-index: 9999;
  box-shadow: 0 5px 25px ${shadow.topbar};
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: normal;
  padding: 0;
  margin: 0;
  height: 100%;
  border-right: 1px solid ${border.smooth};
  padding-right: 1rem;
`;

const TitleImage = styled.img`
  height: 40px;
`;

const DashboardTitle = styled.span`
  margin-left: 0.8rem;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  margin-left: 1rem;
  height: 100%;
`;

const Label = styled.label`
  color: grey;
  margin-right: 1em;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #636262;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  border-right: 1px solid ${border.smooth};
  padding-right: 1rem;

  & + & {
    margin-left: 1rem;
  }

  &:last-child {
    border-right: none;
  }
`;

const InputGroupRight = InputGroup.extend`
  flex-grow: 1;
  flex-direction: row-reverse;
  padding-right: 0;
`;

const CssInput = css`
  border-radius: 3px;
  border: 1px solid ${border.smooth};
  background: white;
  padding: 0.5em 0.5em;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.8rem;

  & + button {
    margin-left: 3px;
  }
`;

const Select = styled.select`
  ${CssInput} font-size: .7rem;
  text-transform: uppercase;
`;

const Input = styled.input`
  ${CssInput} text-transform: none;
`;

const CssButton = css`
  padding: 0.5em 0.5em;
  border: 1px solid ${background.lightGrey};
  border-radius: 3px;
  cursor: pointer;
  background: ${background.lightGrey};
  color: ${font.color.dark};
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  transition: box-shadow 300ms ease-in-out;

  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 5px 15px ${shadow.dark};
  }
`;

const Button = styled.button`
  ${CssButton} border: none;

  & + & {
    margin-left: 0.7rem;
  }
`;

const RunButton = styled.button`
  ${CssButton} padding: .7rem 1.8rem;
  background: ${background.accent};
  color: ${font.color.white};
  white-space: nowrap;

  &:hover {
    box-shadow: 0 5px 15px ${shadow.primaryButton};
  }
`;

const DriverCodeBox = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

const DriverCodeIcon = styled.img`
  width: 20px;
  opacity: 0.7;
  margin-right: 0.3rem;
`;

const DriverCodeLink = styled.a`
  display: flex;
  align-items: center;
  color: black;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    color: ${font.color.accentDark};
  }

  &:hover ${DriverCodeIcon} {
    opacity: 1;
  }
`;

export function DriverCode({ languages, selectedLanguage, actualLanguage }) {
  const driver =
    selectedLanguage === 'auto' ? actualLanguage : selectedLanguage;

  return (
    <DriverCodeBox>
      <DriverCodeLink
        href={languages[driver] && languages[driver].url}
        target="_blank"
      >
        <DriverCodeIcon
          src={githubIcon}
          alt="Driver code repository on GitHub"
          title="Driver code repository on GitHub"
        />
      </DriverCodeLink>
    </DriverCodeBox>
  );
}

<<<<<<< HEAD
export default function Header({
  selectedLanguage,
  languages,
  examples,
  onLanguageChanged,
  onExampleChanged,
  onRunParser,
  loading,
  actualLanguage,
  selectedExample,
  canParse,
}) {
  const languageOptions = Object.keys(languages).map(k => {
    let name = '(auto)';
    if (k === 'auto' && languages[actualLanguage]) {
      name = `${languages[actualLanguage].name} ${name}`;
    } else if (languages[k] && k !== 'auto') {
      name = languages[k].name;
    }
=======
const gistRegexp = new RegExp(
  '^\\s*(?:https?://)?gist.githubusercontent.com/(\\S+\\s*$)'
);
>>>>>>> 7430e32... [WIP] Add Gist Feature

function getGist(input) {
  const parts = input.match(gistRegexp);
  return parts === null ? '' : parts[1];
}

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gistInput: '',
      gistUrl: '',
      isValidGistUrl: false,
    };
  }

  updateGistUrl(input) {
    const gistUrl = getGist(input);
    this.setState({
      gistInput: input,
      gistUrl: gistUrl,
      isValidGistUrl: !!gistUrl,
    });
  }

  onTryLoadingGist() {
    this.props.onLoadGist(this.state.gistUrl);
  }

  onShareGist(shared) {
    console.info('shared url:' + shared);
  }

  getSharableUrl() {
    return 'DASHBOARD_URL#' + this.state.gistUrl;
  }

  render() {
    const {
      selectedLanguage,
      languages,
      examples,
      onLanguageChanged,
      onExampleChanged,
      onRunParser,
      loading,
      actualLanguage,
      selectedExample,
      canParse,
      cleanGist,
    } = this.props;

    const languageOptions = Object.keys(languages).map(k => {
      let name = '(auto)';
      if (k === 'auto' && languages[actualLanguage]) {
        name = `${languages[actualLanguage].name} ${name}`;
      } else if (languages[k] && k !== 'auto') {
        name = languages[k].name;
      }

      return (
        <option value={k} key={k}>
          {name}
        </option>
      );
    });

    const examplesOptions = Object.keys(examples).map((key, k) => (
      <option value={key} key={k}>
        {examples[key].name}
      </option>
    ));

<<<<<<< HEAD
  const examplesOptions = Object.keys(examples).map((key, k) => (
    <option value={key} key={k}>
      {examples[key].name}
    </option>
  ));
=======
    return (
      <Container>
        <Title>
          <TitleImage src={bblfshLogo} alt="bblfsh" />
          <DashboardTitle>Dashboard</DashboardTitle>
        </Title>
>>>>>>> 7430e32... [WIP] Add Gist Feature

        <Actions>
          <InputGroup>
            <Label htmlFor="language-selector">Language</Label>
            <Select
              id="language-selector"
              onChange={onLanguageChanged}
              value={selectedLanguage}
            >
              {languageOptions}
            </Select>

            <DriverCode
              languages={languages}
              selectedLanguage={selectedLanguage}
              actualLanguage={actualLanguage}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="examples-selector">Examples</Label>
            <Select
              id="examples-selector"
              onChange={onExampleChanged}
              value={selectedExample}
            >
              {examplesOptions}
            </Select>
          </InputGroup>

          <InputGroup>
            <Input
              type="url"
              value={this.state.gistInput}
              onChange={e => this.updateGistUrl(e.target.value)}
              placeholder="raw gist url"
            />
            <Button
              onClick={e => this.onTryLoadingGist(e)}
              disabled={!this.state.isValidGistUrl}
            >
              load
            </Button>
            <CopyToClipboard
              text={this.getSharableUrl()}
              onCopy={shared => this.onShareGist(shared)}
            >
              <Button disabled={!cleanGist}>share</Button>
            </CopyToClipboard>
          </InputGroup>

          <InputGroupRight>
            <RunButton
              id="run-parser"
              onClick={onRunParser}
              disabled={!canParse}
            >
              {loading ? 'Parsing...' : 'Run parser'}
            </RunButton>
          </InputGroupRight>
        </Actions>
      </Container>
    );
  }
}
