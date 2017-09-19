import React from 'react';
import App from './App';
import 'jest-styled-components';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import renderer from 'react-test-renderer';

async function renderApp(state) {
  fetch.mockResponse(
    JSON.stringify([
      { id: 'python', name: 'Python', url: 'python-driver' },
      { id: 'java', name: 'Java', url: 'java-driver' }
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
  const wrapper = shallow(<App />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('removes the error when onErrorRemoved is called', async () => {
  const wrapper = await renderApp({ errors: ['1', '2', '3'] });
  wrapper.onErrorRemoved(1);
  expect(wrapper.state.errors).toEqual(['1', '3']);
});

it('changes the editor mode when it updates', async () => {
  const wrapper = await renderApp();
  expect(wrapper.refs.editor.document.getMode().name).toBe('clike');

  wrapper.setState({ selectedLanguage: 'python' });
  expect(wrapper.refs.editor.document.getMode().name).toBe('python');
});

it('onLanguageChanged changes the selected language', async () => {
  const wrapper = await renderApp();
  expect(wrapper.state.selectedLanguage).toBe('auto');

  wrapper.onLanguageChanged('java');
  expect(wrapper.state.selectedLanguage).toBe('java');

  wrapper.onLanguageChanged('does not exist');
  expect(wrapper.state.selectedLanguage).toBe('auto');
});

it('onNodeSelected clears the previously set mark and sets a new one', async () => {
  const clear = jest.fn();
  const wrapper = await renderApp();
  wrapper.mark = { initial: true, clear };
  wrapper.onNodeSelected({ line: 0, ch: 0 }, { line: 0, ch: 2 });

  expect(clear.mock.calls.length).toBe(1);
  expect(wrapper.mark.initial).toBeUndefined();
});

it('clearNodeSelection clears the current mark', async () => {
  const clear = jest.fn();
  const wrapper = await renderApp();
  wrapper.mark = { clear };
  wrapper.clearNodeSelection();

  expect(clear.mock.calls.length).toBe(1);
  expect(wrapper.mark).toBeNull();
});
