import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import 'jest-styled-components';
import Editor from './Editor';

const mkPos = (line, ch) => ({ line, ch });

describe('Editor', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<Editor code="foo = 1" languageMode="python" />);

    expect(toJson(wrapper)).toMatchStyledComponentsSnapshot();
  });

  it('calls onCursorChanged when the selection changes', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <Editor code="foo = 1" languageMode="python" onCursorChanged={spy} />
    );

    wrapper.instance().document.setSelection(mkPos(0, 4), mkPos(0, 2));

    // NOTE: there is an initial call when the CodeMirror is rendered.
    expect(spy.mock.calls.length).toBe(2);
    const [pos] = spy.mock.calls[1];
    expect(pos).toEqual(mkPos(0, 2));
  });

  it('calls onCursorChanged when the cursor position changes', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <Editor code="foo = 1" languageMode="python" onCursorChanged={spy} />
    );

    wrapper.instance().document.setCursor(mkPos(0, 4));

    // NOTE: there is an initial call when the CodeMirror is rendered.
    expect(spy.mock.calls.length).toBe(2);
    const [pos] = spy.mock.calls[1];
    expect(pos).toEqual(mkPos(0, 4));
  });

  it('calls onChange when the content changes', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <Editor code="foo = 1" languageMode="python" onChange={spy} />
    );

    wrapper
      .instance()
      .document.replaceRange('changed', mkPos(0, 0), mkPos(0, 3));

    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0][0]).toBe('changed = 1');
  });

  it('selects the code when selectCode is called', () => {
    const wrapper = mount(<Editor code="foo = 1" languageMode="python" />);

    const assertMarks = n =>
      expect(wrapper.instance().document.getAllMarks().length).toBe(n);

    assertMarks(0);

    const mark = wrapper.instance().selectCode(mkPos(0, 0), mkPos(0, 4));
    assertMarks(1);

    mark.clear();
    assertMarks(0);
  });
});
