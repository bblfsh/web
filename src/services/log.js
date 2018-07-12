/* eslint-disable no-console */

const noop = () => undefined;

export default {
  error: process.env.NODE_ENV !== 'test' ? console.error.bind(console) : noop,
  info: console.info.bind(console),
};
