import { languageToMode } from 'uast-viewer';

export function indexDrivers(drivers) {
  return drivers.reduce((index, { id, name, url }) => {
    index[id] = {
      name,
      url,
      mode: languageToMode(id),
    };
    return index;
  }, {});
}
