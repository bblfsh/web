import React from 'react';
import styled from 'styled-components';
import { font, background, border } from '../styling/variables';
import { connect } from 'react-redux';
import {
  locationsToggle,
  setCustomServerUrl,
  customServerToggle,
  isUrl,
} from '../state/options';

const Container = styled.div`
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
    margin-left: 1.5rem;
  }
`;

const Label = styled.label`
  color: ${font.color.dark};
  padding-left: 0.5rem;
  font-size: 0.8rem;
`;

const TextInput = styled.input`
  margin-left: 0.5rem;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid ${border.smooth};
  outline: none;
  font-size: 0.8rem;
  padding: 0.1rem 0.5rem;
  color: ${props => (props.valid ? 'inherit' : 'red')};
  border-bottom: 1px solid ${props => (props.valid ? border.smooth : 'red')};
`;

export function Options({
  showLocations,
  customServer,
  customServerUrl,
  serverUrlIsValid,
  onLocationsToggle,
  onCustomServerToggle,
  onCustomServerUrlChange,
}) {
  return (
    <Container>
      <Field>
        <input
          type="checkbox"
          name="show-locations"
          checked={showLocations}
          onChange={onLocationsToggle}
        />
        <Label htmlFor="show-locations">Show locations</Label>
      </Field>

      <Field>
        <input
          type="checkbox"
          name="custom-server"
          checked={customServer}
          onChange={onCustomServerToggle}
        />
        <Label htmlFor="custom-server">Custom babelfish server</Label>
        {customServer ? (
          <TextInput
            type="url"
            name="custom-server-url"
            value={customServerUrl}
            onChange={e => onCustomServerUrlChange(e.target.value)}
            disabled={!customServer}
            valid={serverUrlIsValid}
          />
        ) : null}
      </Field>
    </Container>
  );
}

export const mapStateToProps = state => {
  return {
    ...state.options,
    serverUrlIsValid: isUrl(state.options.customServerUrl),
  };
};

const mapDispatchToProps = {
  onLocationsToggle: locationsToggle,
  onCustomServerToggle: customServerToggle,
  onCustomServerUrlChange: setCustomServerUrl,
};

export default connect(mapStateToProps, mapDispatchToProps)(Options);
