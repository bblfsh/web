import * as history from '../services/history';
import { combineReducers } from 'redux';
import { reducer as errors } from './errors';
import {
  reducer as languages,
  load as languagesLoad,
  select as languageSelect,
} from './languages';
import { reducer as options } from './options';
import { reducer as code, runParser } from './code';
import {
  reducer as examples,
  setListByLangs as setExamples,
  select as exampleSelect,
  DEFAULT_EXAMPLE,
} from './examples';
import { reducer as gist, set as gistSet, load as gistLoad } from './gist';
import { reducer as versions, load as versionsLoad } from './versions';

export default combineReducers({
  errors,
  languages,
  options,
  code,
  examples,
  gist,
  versions,
});

export const init = () => (dispatch, getState) => {
  const { gistUrl, lang } = history.parse();

  const mainPromise = dispatch(languagesLoad())
    .then(() => {
      const { languages } = getState().languages;
      return dispatch(setExamples(Object.keys(languages)));
    })
    .then(() => {
      if (lang) {
        dispatch(languageSelect(lang));
      }
    })
    .then(() => {
      if (gistUrl) {
        dispatch(gistSet(gistUrl));
        return dispatch(gistLoad());
      } else {
        return dispatch(exampleSelect(DEFAULT_EXAMPLE));
      }
    })
    .then(() => {
      return dispatch(runParser());
    });

  return Promise.all([mainPromise, dispatch(versionsLoad())]);
};
