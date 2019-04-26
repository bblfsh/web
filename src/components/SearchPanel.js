import React from 'react';
import { connect } from 'react-redux';
import { setUastQuery } from '../state/options';
import { runParserWithQuery } from '../state/code';

export function SearchPanel({ query, loading, onChange, onSearch }) {
  const onSubmit = e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    onSearch();
  };

  return (
    <form className="bblfsh-search-panel__container" onSubmit={onSubmit}>
      <div className="bblfsh-search-panel__field" style={{ width: '100%' }}>
        <input
          className="bblfsh-search-panel__text-input"
          type="text"
          name="query"
          value={query}
          onChange={e => onChange(e.target.value)}
          disabled={loading}
          placeholder="UAST Query"
        />
      </div>
      <div className="bblfsh-search-panel__field">
        <input
          className="bblfsh-search-panel__button"
          type="submit"
          value="Search"
          disabled={loading || !query}
        />
      </div>
      <div className="bblfsh-search-panel__field">
        <a
          href="https://doc.bblf.sh/using-babelfish/uast-querying.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Help
        </a>
      </div>
    </form>
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
