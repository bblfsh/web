import React from 'react';
import App from './App';
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
  const wrapper = shallow(<App />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('render while loading', async () => {
  const wrapper = shallow(<App />);
  wrapper.setState({ code: null });
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('removes the error when onErrorRemoved is called', async () => {
  const wrapper = await renderApp();
  wrapper.setState({ errors: ['1', '2', '3'] });
  wrapper.onErrorRemoved(1);
  expect(wrapper.state.errors).toEqual(['1', '3']);
});

it('changes the editor mode when it updates', async () => {
  const wrapper = await renderApp();
  expect(wrapper.editor.document.getMode().name).toBe('clike');

  wrapper.setState({ selectedLanguage: 'python' });
  expect(wrapper.editor.document.getMode().name).toBe('python');
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

class MockedApp extends App {
  constructor(props) {
    super(props);
    this.onRunParser = props.onRunParser;
  }
}

async function renderMockedApp(onRunParser) {
  const wrapper = mount(<MockedApp onRunParser={onRunParser} />);

  const promise = wrapper.instance().loaded;
  if (promise) {
    await promise;
  }

  return wrapper.instance();
}

it('Parser is ran when the dashboard is loaded', async () => {
  const wrapper = await renderMockedApp(jest.fn());
  expect(wrapper.onRunParser.mock.calls.length).toBe(1);
});

it('Parser is ran when an example is selected', async () => {
  const wrapper = await renderMockedApp(jest.fn());
  wrapper.onExampleChanged('java_example_1');
  expect(wrapper.onRunParser.mock.calls.length).toBe(2);
});

it('Parser is ran when a language is selected', async () => {
  const wrapper = await renderMockedApp(jest.fn());
  wrapper.onLanguageChanged('python');
  expect(wrapper.onRunParser.mock.calls.length).toBe(2);
});
