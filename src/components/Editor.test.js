import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import 'jest-styled-components';
import { Editor, mapStateToProps } from './Editor';

const mkPos = (line, ch) => ({ line, ch });

describe('Editor', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <Editor code="foo = 1" languageMode="python" markRange={null} />
    );

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

  it('selects the code when markRange props is presented', () => {
    const wrapper = mount(
      <Editor
        code="foo = 1"
        languageMode="python"
        markRange={{ from: mkPos(0, 0), to: mkPos(0, 4) }}
      />
    );

    expect(wrapper.instance().document.getAllMarks().length).toBe(1);
  });

  it('change selects the code when markRange is changed', () => {
    const wrapper = mount(
      <Editor
        code="foo = 1"
        languageMode="python"
        markRange={{ from: mkPos(0, 0), to: mkPos(0, 4) }}
      />
    );

    const assertMarks = n =>
      expect(wrapper.instance().document.getAllMarks().length).toBe(n);

    wrapper.setProps({ markRange: null });
    assertMarks(0);

    wrapper.setProps({ markRange: { from: mkPos(0, 0), to: mkPos(0, 4) } });
    assertMarks(1);
  });

  it('mapStateToProps', () => {
    const state = {
      code: {
        code: 'foo = 1',
        markRange: { from: 1, to: 2 },
      },
      languages: {
        languages: {
          python: {
            mode: 'x-python',
          },
        },
        selected: 'python',
      },
    };

    const props = mapStateToProps(state);
    expect(props).toEqual({
      code: 'foo = 1',
      languageMode: 'x-python',
      markRange: { from: 1, to: 2 },
    });
  });
});
