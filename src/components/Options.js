import React from 'react';
import styled from 'styled-components';
import { font, background, border } from '../styling/variables';

const Container = styled.div`
  padding: .5rem 1rem;
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
  padding-left: .5rem;
  font-size: .8rem;
`;

const TextInput = styled.input`
  margin-left: .5rem;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid ${border.smooth};
  outline: none;
  font-size: .8rem;
  padding: .1rem .5rem;
  color: ${props => (props.valid ? 'inherit' : 'red')};
  border-bottom: 1px solid ${props => (props.valid ? border.smooth : 'red')};
`;

export default function Options({
  showLocations,
  customServer,
  customServerUrl,
  serverUrlIsValid,
  onLocationsToggle,
  onCustomServerToggle,
  onCustomServerUrlChange
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
        {customServer
          ? <TextInput
              type="url"
              name="custom-server-url"
              value={customServerUrl}
              onChange={onCustomServerUrlChange}
              disabled={!customServer}
              valid={serverUrlIsValid}
            />
          : null}
      </Field>
    </Container>
  );
}
