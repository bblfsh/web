import React from 'react';

export function Notifications({ children }) {
  return <div className="bblfsh-notification__list">{children}</div>;
}

export function Error({ message, onRemove }) {
  const lines = message.split('\n').map((line, i) => (
    <div className="bblfsh-notification__line" key={i}>
      {line}
    </div>
  ));

  return (
    <div className="bblfsh-notification__error">
      <button className="bblfsh-notification__close-button" onClick={onRemove}>
        ×
      </button>
      <h5 className="bblfsh-notification__title">Error</h5>
      <div className="bblfsh-notification__body">{lines}</div>
    </div>
  );
}
