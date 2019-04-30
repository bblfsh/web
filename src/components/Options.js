import React from 'react';
import { connect } from 'react-redux';
import {
  locationsToggle,
  setCustomServerUrl,
  customServerToggle,
  isUrl,
} from '../state/options';

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
    <div className="bblfsh-options__container">
      <div className="bblfsh-options__field">
        <input
          type="checkbox"
          id="show-locations"
          name="show-locations"
          checked={showLocations}
          onChange={onLocationsToggle}
        />
        <label className="bblfsh-options__label" htmlFor="show-locations">
          Show locations
        </label>
      </div>

      <div className="bblfsh-options__field">
        <input
          type="checkbox"
          id="custom-server"
          name="custom-server"
          checked={customServer}
          onChange={onCustomServerToggle}
        />
        <label className="bblfsh-options__label" htmlFor="custom-server">
          Custom babelfish server
        </label>
        {customServer ? (
          <input
            className={
              'bblfsh-options__text-input' +
              (serverUrlIsValid ? '' : ' invalid')
            }
            type="url"
            name="custom-server-url"
            value={customServerUrl}
            onChange={e => onCustomServerUrlChange(e.target.value)}
            disabled={!customServer}
          />
        ) : null}
      </div>
    </div>
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
