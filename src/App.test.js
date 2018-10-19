import React from 'react';
import { App } from './App';
import 'jest-styled-components';
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
  const wrapper = shallow(<App errors={[]} code="foo = 1" init={noop} />);
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});

it('render while loading', async () => {
  const wrapper = shallow(<App errors={[]} code={null} init={noop} />);
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});

it('render with errors', async () => {
  const wrapper = shallow(
    <App errors={['error1', 'error2']} code="foo = 1" init={noop} />
  );
  expect(toJsonFixed(wrapper)).toMatchSnapshot();
});
