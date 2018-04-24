export function indexDrivers(drivers) {
  return drivers.reduce((index, { id, name, url }) => {
    index[id] = {
      name,
      url,
      mode: modeForLang(id),
    };
    return index;
  }, {});
}

const specialLanguageModes = {
  java: 'text/x-java',
  bash: 'shell',
};

function modeForLang(lang) {
  if (specialLanguageModes.hasOwnProperty(lang)) {
    return specialLanguageModes[lang];
  }
  return lang;
}
