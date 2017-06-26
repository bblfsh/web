import React from 'react';
import styled from 'styled-components';

const Container = styled.header`
  height: 70px;
`

export default function Header() {
  return (
    <Container>
      Babelfish Dashboard
    </Container>
  );
}
