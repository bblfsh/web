import React from 'react';
import { App } from './App';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const noop = () => null;

// apparently SplitPane component keeps enviroment information as a prop.
// and they are different on linux/os/ci/nodejs/...
const toJsonFixed = wrapper =>
  toJson(wrapper, {
    map: json => {
      delete json.props.prefixer;
      return json;
    },
  });

it('renders without crashing', () => {
  const wrapper = shallow(
    <App
      errors={[]}
      code="foo = 1"
      init={noop}
      languages={{
        loading: false,
        languages: {
          '': { name: '(auto)' },
          bash: {
            name: 'Bash',
            url: 'https://github.com/bblfsh/bash-driver',
            mode: 'text/x-sh',
            version: 'v2.4.0',
          },
          cpp: {
            name: 'C++',
            url: 'https://github.com/bblfsh/cpp-driver',
            mode: 'text/x-c++src',
            version: 'v1.1.0',
          },
        },
        actual: 'java',
        selected: '',
        loadedFrom: undefined,
      }}
    />
  );
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});

it('render while loading', async () => {
  const wrapper = shallow(<App errors={[]} code={null} init={noop} />);
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});

it('render with errors', async () => {
  const wrapper = shallow(
    <App
      errors={[{ message: 'error1' }, { message: 'error2' }]}
      code="foo = 1"
      init={noop}
    />
  );
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});
