import React from 'react';
import styled from 'styled-components';
import { background, border } from '../styling/variables';
import { CssButton } from './Button';
import { connect } from 'react-redux';
import { setUastQuery } from 'state/options';
import { runParserWithQuery } from 'state/code';

const Container = styled.form`
  padding: 0.5rem 1rem;
  display: flex;
  background: ${background.light};
  border-bottom: 1px solid ${border.smooth};
  min-height: 2.5rem;
`;

const Field = styled.div`
  display: flex;
  align-items: center;

  & + & {
    margin-left: 1rem;
  }
`;

const TextInput = styled.input`
  width: 100%;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid ${border.smooth};
  outline: none;
  font-size: 0.8rem;
  padding: 0.1rem 0.5rem;
`;

const Button = styled.input`
  ${CssButton} border: none;
`;

export function SearchPanel({ query, loading, onChange, onSearch }) {
  const onSubmit = e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    onSearch();
  };

  return (
    <Container onSubmit={onSubmit}>
      <Field style={{ width: '100%' }}>
        <TextInput
          type="text"
          name="query"
          value={query}
          onChange={e => onChange(e.target.value)}
          disabled={loading}
          placeholder="UAST Query"
        />
      </Field>
      <Field>
        <Button type="submit" value="Search" disabled={loading || !query} />
      </Field>
      <Field>
        <a
          href="https://doc.bblf.sh/user/uast-querying.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Help
        </a>
      </Field>
    </Container>
  );
}

const mapStateToProps = state => {
  return {
    query: state.options.uastQuery,
    loading: state.code.loading,
    isValid: true,
  };
};

const mapDispatchToProps = {
  onChange: setUastQuery,
  onSearch: runParserWithQuery,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPanel);
