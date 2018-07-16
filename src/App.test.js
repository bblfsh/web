import React from 'react';
import { App } from './App';
import 'jest-styled-components';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const noop = () => null;

it('renders without crashing', () => {
  const wrapper = shallow(<App errors={[]} code="foo = 1" init={noop} />);
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('render while loading', async () => {
  const wrapper = shallow(<App errors={[]} code={null} init={noop} />);
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('render with errors', async () => {
  const wrapper = shallow(
    <App errors={['error1', 'error2']} code="foo = 1" init={noop} />
  );
  expect(toJson(wrapper)).toMatchSnapshot();
});
