import React, { Component } from 'react';
import styled from 'styled-components';
import Node from './Node';

const NotFound = styled.div`
  width: 100%;
  padding: 1rem 0;
  text-align: center;
`;

export default class SearchResults extends Component {
  render() {
    const { resultIds, onNodeSelected } = this.props;

    if (!resultIds || !resultIds.length) {
      return <NotFound>Nothing found</NotFound>;
    }

    return (
      <div>
        {resultIds.map(id => {
          return <Node key={id} id={id} onNodeSelected={onNodeSelected} />;
        })}
      </div>
    );
  }
}
