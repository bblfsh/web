import querystring from 'querystring';
// We can use window.location instead now
// but most probably we will need "back" button in near future
// so I think, it's better to use history already
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

export function setExample() {
  // we can actually set example name but it's out of scope for current task
  history.replace('.');
}

export function setLanguage(lang) {
  history.replace({
    ...history.location,
    search: lang ? `?lang=${lang}` : null,
  });
}

export function setGist(url) {
  history.replace({
    ...history.location,
    hash: '#' + url,
  });
}

export function parse() {
  const loc = history.location;

  let gistUrl;
  if (loc.hash && loc.hash.length > 1) {
    gistUrl = loc.hash.slice(1);
  }

  let lang;
  if (loc.search && loc.search.length > 1) {
    const query = querystring.parse(history.location.search.slice(1));
    lang = query.lang;
  }

  return {
    gistUrl,
    lang,
  };
}
