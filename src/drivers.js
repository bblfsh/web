import { languageToMode } from 'uast-viewer';

export function indexDrivers(drivers) {
  return drivers.reduce((index, { id, name, url, version }) => {
    index[id] = {
      name,
      url,
      mode: languageToMode(id),
      version,
    };
    return index;
  }, {});
}
