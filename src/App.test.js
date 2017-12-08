import React from 'react';
import { App } from './App';
import 'jest-styled-components';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

it('renders without crashing', () => {
  const wrapper = shallow(<App errors={[]} code="foo = 1" />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('render while loading', async () => {
  const wrapper = shallow(<App errors={[]} code={null} />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('render with errors', async () => {
  const wrapper = shallow(<App errors={['error1', 'error2']} code="foo = 1" />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});
