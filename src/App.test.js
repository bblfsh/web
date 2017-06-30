import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'jest-styled-components';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import renderer from 'react-test-renderer';

function renderApp(state) {
  const elem = document.createElement('div');
  const component = ReactDOM.render(<App />, elem);
  if (state) {
    component.setState(state);
  }
  return component;
}

it('renders without crashing', () => {
  const wrapper = shallow(<App />);
  expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
});

it('removes the error when onErrorRemoved is called', () => {
  const wrapper = renderApp({ errors: ['1', '2', '3'] });
  wrapper.onErrorRemoved(1);
  expect(wrapper.state.errors).toEqual(['1', '3']);
});

it('changes the editor mode when it updates', () => {
  const wrapper = renderApp();
  expect(wrapper.refs.editor.document.getMode().name).toBe('python');

  wrapper.setState({ selectedLanguage: 'java' });
  expect(wrapper.refs.editor.document.getMode().name).toBe('clike');
});

it('onLanguageChanged changes the selected language', () => {
  const wrapper = renderApp();
  expect(wrapper.state.selectedLanguage).toBe('auto');

  wrapper.onLanguageChanged('java');
  expect(wrapper.state.selectedLanguage).toBe('java');

  wrapper.onLanguageChanged('does not exist');
  expect(wrapper.state.selectedLanguage).toBe('auto');
});

it('onNodeSelected clears the previously set mark and sets a new one', () => {
  const clear = jest.fn();
  const wrapper = renderApp();
  wrapper.mark = { initial: true, clear };
  wrapper.onNodeSelected({ line: 0, ch: 0 }, { line: 0, ch: 2 });

  expect(clear.mock.calls.length).toBe(1);
  expect(wrapper.mark.initial).toBeUndefined();
});

it('clearNodeSelection clears the current mark', () => {
  const clear = jest.fn();
  const wrapper = renderApp();
  wrapper.mark = { clear };
  wrapper.clearNodeSelection();

  expect(clear.mock.calls.length).toBe(1);
  expect(wrapper.mark).toBeNull();
});
