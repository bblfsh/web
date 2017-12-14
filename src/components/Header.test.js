import React from 'react';
import { shallow } from 'enzyme';
import 'jest-styled-components';
import { Header, DriverCode } from './Header';
import renderer from 'react-test-renderer';

const testLanguages = {
  '': { name: 'auto' },
  python: { name: 'Python', url: 'Python.driver' },
  java: { name: 'Java', url: 'Java.driver' },
};

const testExamples = {
  python: {
    code: '',
  },
  java: {
    code: '',
  },
};

describe('DriverCode', () => {
  it('contains the driver URL if selectedLanguage is not auto', () => {
    const component = renderer.create(
      <DriverCode
        languages={testLanguages}
        actualLanguage="java"
        selectedLanguage="java"
        examples={testExamples}
      />
    );

    expect(component.toJSON()).toMatchStyledComponentsSnapshot();
  });

  it('contains the actualLanguage URL if is auto', () => {
    const component = renderer.create(
      <DriverCode
        languages={testLanguages}
        actualLanguage="python"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    expect(component.toJSON()).toMatchStyledComponentsSnapshot();
  });
});

describe('Header', () => {
  it('renders correctly', () => {
    const component = renderer.create(
      <Header
        languages={testLanguages}
        actualLanguage="java"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    expect(component.toJSON()).toMatchStyledComponentsSnapshot();
  });

  it('calls onLanguageChanged when the dropdown is changed', () => {
    const onLanguageChangedSpy = jest.fn();
    const wrapper = shallow(
      <Header
        languages={testLanguages}
        onLanguageChanged={onLanguageChangedSpy}
        actualLanguage="java"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    wrapper.find('#language-selector').simulate('change', {
      target: { value: 'python' },
    });
    expect(onLanguageChangedSpy.mock.calls.length).toBe(1);
    expect(onLanguageChangedSpy.mock.calls[0][0]).toBe('python');
  });

  it('calls onExampleChanged when the dropdown is changed', () => {
    const spy = jest.fn();
    const wrapper = shallow(
      <Header
        languages={testLanguages}
        onExampleChanged={spy}
        actualLanguage="java"
        selectedLanguage=""
        selectedExample="python"
        examples={testExamples}
      />
    );

    wrapper.find('#examples-selector').simulate('change', {
      target: { value: 'java' },
    });
    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0][0]).toBe('java');
  });

  it('calls onRunParser when the button is clicked', () => {
    const onRunParserSpy = jest.fn();
    const wrapper = shallow(
      <Header
        languages={testLanguages}
        onRunParser={onRunParserSpy}
        actualLanguage="java"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    wrapper.find('#run-parser').simulate('click');
    expect(onRunParserSpy.mock.calls.length).toBe(1);
  });

  it('has the button disabled if canParse is false', () => {
    const component = renderer.create(
      <Header
        languages={testLanguages}
        canParse={false}
        actualLanguage="python"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    expect(component.toJSON()).toMatchStyledComponentsSnapshot();
  });

  it('has the button enabled if canParse is true', () => {
    const component = renderer.create(
      <Header
        languages={testLanguages}
        canParse={true}
        actualLanguage="python"
        selectedLanguage=""
        examples={testExamples}
      />
    );

    expect(component.toJSON()).toMatchStyledComponentsSnapshot();
  });
});
