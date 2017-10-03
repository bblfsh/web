const defaultServerUrl =
  process.env.REACT_APP_SERVER_URL || 'http://0.0.0.0:9999/api';

const apiUrl = url => `${defaultServerUrl}${url}`;

const unexpectedErrorMsg =
  'Unexpected error contacting babelfish server. Please, try again.';

export function parse(language, code, serverUrl) {
  return new Promise((resolve, reject) => {
    return fetch(apiUrl('/parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        server_url: serverUrl,
        language,
        content: code
      })
    })
      .then(resp => resp.json())
      .then(({ status, errors, uast }) => {
        if (status === 0) {
          resolve(uast);
        } else {
          reject(errors ? errors.map(normalizeError) : ["unexpected error"]);
        }
      })
      .catch(err => {
        console.error(err);
        reject([unexpectedErrorMsg]);
      });
  });
}

export function listDrivers() {
  return fetch(apiUrl('/drivers')).then(checkStatus).then(resp => resp.json());
}

function checkStatus(resp) {
  if (resp.status < 200 || resp.status >= 300) {
    const error = new Error(resp.statusText);
    error.response = resp;
    throw error;
  }
  return resp;
}

function normalizeError(err) {
  if (typeof err === 'object' && err.hasOwnProperty('message')) {
    return err.message;
  } else if (typeof err === 'string') {
    return err;
  }

  return null;
}
