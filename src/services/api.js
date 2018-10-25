import log from './log';

const defaultServerUrl =
  process.env.REACT_APP_SERVER_URL || 'http://0.0.0.0:9999/api';

const apiUrl = url => `${defaultServerUrl}${url}`;

const unexpectedErrorMsg =
  'Unexpected error contacting babelfish server. Please, try again.';

function returnUnexpectedError(err) {
  log.error(err);
  throw [unexpectedErrorMsg];
}

function checkStatus(resp) {
  if (resp.status < 200 || resp.status >= 300) {
    const error = new Error(resp.statusText);
    error.response = resp;
    throw error;
  }
  return resp;
}

function parseError(resp) {
  // Bad Request, try to read error message
  if (resp.status === 400) {
    return resp
      .json()
      .then(json => json.errors.map(e => e.message))
      .catch(returnUnexpectedError)
      .then(errors => {
        throw errors;
      });
  }

  return checkStatus(resp);
}

export function parse(mode, language, filename, code, query, serverUrl) {
  return fetch(apiUrl('/parse'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      server_url: serverUrl,
      mode,
      language,
      filename,
      content: code,
      query,
    }),
  })
    .catch(returnUnexpectedError)
    .then(parseError)
    .then(resp => resp.json().catch(returnUnexpectedError));
}

function normalizeError(err) {
  if (typeof err === 'object' && err.hasOwnProperty('message')) {
    return err.message;
  } else if (typeof err === 'string') {
    return err;
  }

  return null;
}

export function getGist(gist) {
  return new Promise((resolve, reject) => {
    return fetch(apiUrl('/gist?url=' + gist), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then(resp => resp.text())
      .then(code => resolve(code))
      .catch(err => {
        log.error(err);
        reject([err].map(normalizeError));
      });
  });
}

export function version(serverUrl) {
  return info(infoEndpoints.version, serverUrl);
}

export function listDrivers(serverUrl) {
  return info(infoEndpoints.drivers, serverUrl);
}

const infoEndpoints = {
  version: '/version',
  drivers: '/drivers',
};

export function info(endpoint, serverUrl) {
  return fetch(apiUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      server_url: serverUrl,
    }),
  })
    .then(checkStatus)
    .then(resp => resp.json())
    .catch(err => {
      log.error(err);
      return Promise.reject([err].map(normalizeError));
    });
}
