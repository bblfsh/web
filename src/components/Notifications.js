import React from 'react';
import styled from 'styled-components';

const NotificationList = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  max-width: 50%;
  z-index: 9999;
`;

const BaseNotification = styled.div`
  position: relative;
  border-radius: 5px;
  padding: 1rem;
  margin: 0 1rem 1rem 1rem;
`;

const NotificationLine = styled.p`
  padding: 0;
  margin: 0;

  & + & {
    margin-top: 0.5rem;
  }
`;

export var CloseButton = styled.button`
  font-size: 1.5rem;
  position: absolute;
  right: 0.5rem;
  top: 0.2rem;
  padding: 0.3rem 0.5rem;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const ErrorNotification = BaseNotification.extend`
  background: #f44336;
  color: white;
  box-shadow: 0 4px 20px rgba(148, 12, 12, 0.38);

  & ${CloseButton} {
    color: white;
  }
`;

const Title = styled.h5`
  padding: 0;
  margin: 0;
  font-size: 1.2rem;
`;

export function Notifications({ children }) {
  return <NotificationList>{children}</NotificationList>;
}

export function Error({ message, onRemove }) {
  const lines = message
    .split('\n')
    .map((line, i) => <NotificationLine key={i}>{line}</NotificationLine>);

  return (
    <ErrorNotification>
      <CloseButton onClick={onRemove}>×</CloseButton>
      <Title>Error</Title>
      {lines}
    </ErrorNotification>
  );
}
