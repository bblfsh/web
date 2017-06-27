import React from 'react';
import styled from 'styled-components';

import bblfshLogo from '../img/babelfish_logo.svg';
import githubIcon from '../img/github.svg';

const Container = styled.header`
  height: 70px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid black;
`

const Title = styled.h1`
  display: flex;
  align-items: center;
`

const TitleImage = styled.img`
  height: 40px;
`

const DashboardTitle = styled.span`
  font-weight: bold;
  font-size: 1.5rem;
  margin-left: .5rem;
`

const Actions = styled.div`
  width: 100%;
  display: flex;
  margin-left: 1rem;
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;

  & + & {
    margin-left: 1rem;
  }

  & > label {
    margin-right: .5rem;
  }
`

const RunButton = styled.button`
  padding: .2rem 1.5rem;
  border-radius: 3px;
  border: none;
  cursor: pointer;
`

const DriverCodeBox = styled.div`
  display: flex;
  align-items: center;
  margin-left: .5rem;
`

const DriverCodeText = styled.a`
  margin-left: .5rem;
`

export function DriverCode({ languages, selectedLanguage, actualLanguage }) {
  const driver = selectedLanguage === 'auto' 
    ? actualLanguage
    : selectedLanguage;

  return (
    <DriverCodeBox>
      <img src={githubIcon} alt='GitHub' />
      <DriverCodeText 
        href={languages[driver].url} 
        target='_blank'>
        Driver Code
      </DriverCodeText>
    </DriverCodeBox>
  );
}

export default function Header({
  selectedLanguage, 
  languages, 
  onLanguageChanged,
  onRunParser,
  loading,
  actualLanguage,
  userHasTyped,
}) {
  const languageOptions = Object.keys(languages)
    .map(k => {
      const name = k === 'auto' 
        ? `${languages[actualLanguage].name} ${languages[k].name}`
        : languages[k].name;
      return (
        <option value={k} key={k}>{name}</option>
      );
    });

  return (
    <Container>
      <Title>
        <TitleImage src={bblfshLogo} alt='bblfsh' />
        <DashboardTitle>Dashboard</DashboardTitle>
      </Title>

      <Actions>
        <InputGroup>
          <label htmlFor='language'>Language:</label>
          <select 
            id='language'
            onChange={onLanguageChanged}
            value={selectedLanguage}>
            {languageOptions}
          </select>

          <DriverCode 
            languages={languages}
            selectedLanguage={selectedLanguage}
            actualLanguage={actualLanguage} />
        </InputGroup>

        <InputGroup>
          <RunButton 
            id='run-parser'
            onClick={onRunParser}
            disabled={loading || !userHasTyped}>
            Run parser
          </RunButton>
        </InputGroup>
      </Actions>
    </Container>
  );
}
