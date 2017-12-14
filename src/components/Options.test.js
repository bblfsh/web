import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import { Options } from './Options';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchStyledComponentsSnapshot();
};

test('it renders correctly', () => {
  shouldMatchSnapshot(<Options />);
});

test('it call onLocationsToggle when the checkbox is clicked', () => {
  const spy = jest.fn();
  const wrapper = shallow(<Options onLocationsToggle={spy} />);
  wrapper.find('[name="show-locations"]').simulate('change');
  expect(spy.mock.calls.length).toBe(1);
});

test('it call onCustomServerToggle when the checkbox is clicked', () => {
  const spy = jest.fn();
  const wrapper = shallow(<Options onCustomServerToggle={spy} />);
  wrapper.find('[name="custom-server"]').simulate('change');
  expect(spy.mock.calls.length).toBe(1);
});

test('it renders the server url field if customServer is true', () => {
  const wrapper = shallow(<Options customServer={true} />);
  expect(wrapper.find('[name="custom-server-url"]').length).toBe(1);
});

test('it does not render the server url field if customServer is true', () => {
  const wrapper = shallow(<Options customServer={false} />);
  expect(wrapper.find('[name="custom-server-url"]').length).toBe(0);
});
