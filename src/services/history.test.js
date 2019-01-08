import * as history from './history';

let mockLocation;
const mockParser = document.createElement('a');
jest.mock('history/createBrowserHistory', () => {
  const location = {};
  [
    'href',
    'protocol',
    'host',
    'hostname',
    'origin',
    'port',
    'pathname',
    'search',
    'hash',
  ].forEach(prop => {
    Object.defineProperty(location, prop, {
      get: function() {
        mockParser.href = mockLocation;
        return mockParser[prop];
      },
    });
  });
  return () => ({ location });
});

describe('history/parse', () => {
  const origLocation = document.location.href;

  afterEach(() => {
    mockLocation = origLocation;
  });

  it('should return gist and lang when presented', () => {
    mockLocation = 'http://localhost/?lang=python#path/to/gist';

    const { gistUrl, lang } = history.parse();

    expect(gistUrl).toEqual('path/to/gist');
    expect(lang).toEqual('python');
  });

  it('should return gist when presented', () => {
    mockLocation = 'http://localhost/#path/to/gist';

    const { gistUrl, lang } = history.parse();

    expect(gistUrl).toEqual('path/to/gist');
    expect(lang).toBeUndefined();
  });

  it('should return nothing', () => {
    mockLocation = 'http://localhost/';

    const { gistUrl, lang } = history.parse();
    expect(gistUrl).toBeUndefined();
    expect(lang).toBeUndefined();
  });
});
