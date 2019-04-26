import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { ParseModeSwitcher } from './ParseModeSwitcher';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchSnapshot();
};

test('it renders correctly', () => {
  shouldMatchSnapshot(
    <ParseModeSwitcher mode={'semantic'} onChange={() => null} />
  );
});

test('it calls onChange when the input is clicked', () => {
  const spy = jest.fn();
  const wrapper = shallow(
    <ParseModeSwitcher mode={'semantic'} onChange={spy} />
  );
  wrapper
    .find('[value="annotated"]')
    .simulate('change', { target: { value: 'annotated' } });
  expect(spy.mock.calls.length).toBe(1);
});
