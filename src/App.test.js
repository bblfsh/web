import React from 'react';
import { App } from './App';
import 'jest-styled-components';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

async function renderApp(state) {
  fetch.mockResponse(
    JSON.stringify([
      { id: 'python', name: 'Python', url: 'python-driver' },
      { id: 'java', name: 'Java', url: 'java-driver' },
    ])
  );

  const wrapper = mount(<App />);
  if (state) {
    wrapper.setState(state);
  }

  const promise = wrapper.instance().loaded;
  if (promise) {
    await promise;
  }

  return wrapper.instance();
}

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
