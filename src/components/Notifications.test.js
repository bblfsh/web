import React from 'react';
import { shallow } from 'enzyme';
import { Error, CloseButton } from './Notifications';
import renderer from 'react-test-renderer';
import 'jest-styled-components';

describe('Error', () => {
  it('should render correctly', () => {
    const msg = 'Foo bar\nBaz qux';
    const wrapper = renderer.create(<Error message={msg} />);

    expect(wrapper).toMatchStyledComponentsSnapshot();
  });

  it('should call onRemove when the close button is clicked', () => {
    const spy = jest.fn();
    const wrapper = shallow(<Error message="foo" onRemove={spy} />);

    wrapper.find(CloseButton).simulate('click');
    expect(spy.mock.calls.length).toBe(1);
  });
});
