import React from 'react';
import { shallow, mount } from 'enzyme';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

import {
  Node,
  CollapsibleItem,
  StyledCollapsibleContent,
  StyledCollapsibleTitle,
  StyledItem,
  Roles,
  Children,
  Property,
  Properties,
  Value,
  PropertyName,
  Position,
} from './Node';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchStyledComponentsSnapshot();
};

describe('CollapsibleItem', () => {
  it('collapsed item should be hidden', () => {
    const wrapper = mount(<CollapsibleItem collapsed={true} />);
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'none');
  });

  it('expanded item should not be hidden', () => {
    const wrapper = mount(<CollapsibleItem collapsed={false} />);
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'block');
  });

  it('is collapsed when the title is clicked', () => {
    const wrapper = mount(<CollapsibleItem collapsed={false} />);
    const title = wrapper.find(StyledCollapsibleTitle);
    title.simulate('click');
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'none');
  });

  it('is expanded when the title is clicked and it was collpased', () => {
    const wrapper = mount(<CollapsibleItem collapsed={true} />);
    const title = wrapper.find(StyledCollapsibleTitle);
    title.simulate('click');
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'block');
  });

  it('calls onNodeSelected when the mouse is over the node', () => {
    const spy = jest.fn();
    const wrapper = mount(<CollapsibleItem onNodeSelected={spy} />);
    wrapper.find(StyledItem).simulate('mousemove');

    expect(spy.mock.calls.length).toBe(1);
  });

  it('renders correctly', () => {
    shouldMatchSnapshot(
      <CollapsibleItem name="foo">yada yada</CollapsibleItem>
    );
  });
});

test('Roles renders correctly', () => {
  shouldMatchSnapshot(<Roles roles={['a', 'b', 'c']} />);
});

test('Position renders correctly', () => {
  shouldMatchSnapshot(
    <Position name="foo" position={{ Offset: 1, Line: 1, Col: 1 }} />
  );
});

describe('Children', () => {
  const initialState = {
    code: {
      ast: {
        2: {
          id: 2,
          StartPosition: { Col: 1, Line: 1, Offset: 1 },
          EndPosition: { Col: 1, Line: 1, Offset: 1 },
          Roles: ['a', 'b'],
          InternalType: 'foo',
        },
        3: {
          id: 3,
          StartPosition: { Col: 2, Line: 1, Offset: 1 },
          EndPosition: { Col: 2, Line: 1, Offset: 1 },
          Roles: ['a', 'c'],
          InternalType: 'bar',
        },
      },
    },
    options: { showLocations: false },
  };
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders correctly', () => {
    const children = [2, 3];
    shouldMatchSnapshot(
      <Provider store={store}>
        <Children ids={children} />
      </Provider>
    );
  });
});

test('Property renders correctly', () => {
  shouldMatchSnapshot(<Property name="foo" value="bar" />);
});

test('Properties renders correctly', () => {
  shouldMatchSnapshot(
    <Properties
      properties={{
        foo: 'bar',
        baz: 'qux',
      }}
    />
  );
});

describe('Value', () => {
  it('should have text "null" when the value is null', () => {
    const wrapper = mount(<Value value={null} />);
    expect(wrapper.text()).toBe('null');
  });

  it('should render correctly with value', () => {
    shouldMatchSnapshot(<Value value={1} />);
  });
});

test('PropertyName renders correctly', () => {
  shouldMatchSnapshot(<PropertyName name="foo" />);
});

describe('Node', () => {
  const initialState = {
    code: {
      ast: {
        2: {
          id: 2,
          StartPosition: { Col: 1, Line: 1, Offset: 1 },
          EndPosition: { Col: 1, Line: 1, Offset: 1 },
          Roles: ['a', 'b'],
          InternalType: 'foo',
        },
        3: {
          id: 3,
          StartPosition: { Col: 2, Line: 1, Offset: 1 },
          EndPosition: { Col: 2, Line: 1, Offset: 1 },
          Roles: ['a', 'c'],
          InternalType: 'bar',
        },
      },
    },
    options: { showLocations: false },
  };

  it('renders correctly', () => {
    const store = mockStore(initialState);
    const node = {
      id: 1,
      InternalType: 'foo',
      Roles: ['e', 'g'],
      StartPosition: { Col: 1, Line: 2, Offset: 3 },
      EndPosition: { Col: 4, Line: 5, Offset: 6 },
      Token: 'bar',
      Properties: {
        a: 'b',
        c: 'd',
        foo: false,
      },
      Children: [2, 3],
    };

    shouldMatchSnapshot(
      <Provider store={store}>
        <Node node={node} showLocations={false} />
      </Provider>
    );
  });

  it('when the node is selected it calls onNodeSelected', () => {
    const spy = jest.fn();
    const node = {
      StartPosition: { Col: 2, Line: 2, Offset: 1 },
      EndPosition: { Col: 6, Line: 2, Offset: 6 },
    };
    const wrapper = mount(<Node node={node} onNodeSelected={spy} />);

    wrapper
      .find(StyledItem)
      .first()
      .simulate('mousemove');
    expect(spy.mock.calls.length).toBe(1);
    const { line, ch } = spy.mock.calls[0][0];
    expect(line).toBe(1);
    expect(ch).toBe(1);
  });

  it('when showLocations is false, it does not display the locations', () => {
    const node = {
      StartPosition: { Col: 2, Line: 2, Offset: 1 },
      EndPosition: { Col: 6, Line: 2, Offset: 6 },
    };
    const wrapper = mount(<Node node={node} showLocations={false} />);

    expect(wrapper.find(Position).length).toBe(0);
  });

  it('when showLocations is true, it does display them', () => {
    const node = {
      StartPosition: { Col: 2, Line: 2, Offset: 1 },
      EndPosition: { Col: 6, Line: 2, Offset: 6 },
    };
    const wrapper = mount(<Node node={node} showLocations={true} />);

    expect(wrapper.find(Position).length).toBe(2);
  });
});
