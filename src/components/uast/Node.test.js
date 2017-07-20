import React from 'react';
import { shallow, mount } from 'enzyme';
import 'jest-styled-components';
import renderer from 'react-test-renderer';

import Node, {
  MAX_EXPANDED_DEPTH,
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
  Position
} from './Node';

const shouldMatchSnapshot = comp => {
  const wrapper = renderer.create(comp);
  expect(wrapper.toJSON()).toMatchStyledComponentsSnapshot();
};

describe('CollapsibleItem', () => {
  it('is collapsed if the depth is higher than MAX_EXPANDED_DEPTH', () => {
    const wrapper = mount(<CollapsibleItem depth={MAX_EXPANDED_DEPTH + 1} />);
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'none');
  });

  it('is not collapsed if the depth is lower than MAX_EXPANDED_DEPTH', () => {
    const wrapper = mount(<CollapsibleItem depth={MAX_EXPANDED_DEPTH - 1} />);
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'block');
  });

  it('is collapsed when the title is clicked', () => {
    const wrapper = mount(<CollapsibleItem depth={MAX_EXPANDED_DEPTH - 1} />);
    const title = wrapper.find(StyledCollapsibleTitle);
    title.simulate('click');
    const content = wrapper.find(StyledCollapsibleContent);
    expect(content).toHaveStyleRule('display', 'none');
  });

  it('is expanded when the title is clicked and it was collpased', () => {
    const wrapper = mount(<CollapsibleItem depth={MAX_EXPANDED_DEPTH + 1} />);
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

  it('expand expands the node', () => {
    const wrapper = shallow(<CollapsibleItem depth={MAX_EXPANDED_DEPTH + 1} />);
    wrapper.instance().expand();
    expect(wrapper.state('collapsed')).toBe(false);
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
  it('renders correctly', () => {
    const children = [
      {
        StartPosition: { Col: 1, Line: 1, Offset: 1 },
        EndPosition: { Col: 1, Line: 1, Offset: 1 },
        Roles: ['a', 'b'],
        InternalType: 'foo'
      },
      {
        StartPosition: { Col: 2, Line: 1, Offset: 1 },
        EndPosition: { Col: 2, Line: 1, Offset: 1 },
        Roles: ['a', 'c'],
        InternalType: 'bar'
      }
    ];
    shouldMatchSnapshot(
      <Children path={[]} children={children} depth={1} onMount={jest.fn()} />
    );
  });

  it('expands itself and its ancestors when expand is called', () => {
    const path = [{ expand: jest.fn() }, { expand: jest.fn() }];

    const wrapper = mount(
      <Children path={path} children={[]} depth={MAX_EXPANDED_DEPTH + 1} />
    );

    wrapper.instance().expand();
    expect(wrapper.ref('collapsible').get(0).state.collapsed).toBe(false);
    path.map(i => i.expand.mock.calls.length).forEach(i => expect(i).toBe(1));
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
        baz: 'qux'
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
  it('calls onMount when it is constructed', () => {
    const spy = jest.fn();
    const component = mount(<Node onMount={spy} tree={{}} />);
    expect(spy.mock.calls.length).toBe(1);
  });

  it("calls onMount when it's updated", () => {
    const spy = jest.fn();
    const component = mount(<Node onMount={spy} tree={{}} />);
    component.instance().forceUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
    });
  });

  it('expands itself and all its ancestors', () => {
    const path = [{ expand: jest.fn() }, { expand: jest.fn() }];
    const wrapper = mount(
      <Node tree={{}} path={path} depth={MAX_EXPANDED_DEPTH + 1} />
    );

    wrapper.instance().expand();
    expect(wrapper.ref('collapsible').get(0).state.collapsed).toBe(false);
    path.map(i => i.expand.mock.calls.length).forEach(i => expect(i).toBe(1));
  });

  it('highlights itself when highlight is called', () => {
    const wrapper = shallow(<Node tree={{}} />);

    wrapper.instance().highlight();
    expect(wrapper.state('highlighted')).toBe(true);
  });

  it('unhighlights itself when unHighlight is called', () => {
    const wrapper = shallow(<Node tree={{}} />);
    const component = wrapper.instance();

    component.highlight();
    component.unHighlight();
    expect(wrapper.state('highlighted')).toBe(false);
  });

  it('renders correctly', () => {
    const node = {
      InternalType: 'foo',
      Roles: ['e', 'g'],
      StartPosition: { Col: 1, Line: 2, Offset: 3 },
      EndPosition: { Col: 4, Line: 5, Offset: 6 },
      Token: 'bar',
      Properties: {
        a: 'b',
        c: 'd',
        foo: false
      },
      Children: [
        {
          StartPosition: { Col: 1, Line: 1, Offset: 1 },
          EndPosition: { Col: 1, Line: 1, Offset: 1 },
          Roles: ['a', 'b'],
          InternalType: 'foo'
        },
        {
          StartPosition: { Col: 2, Line: 1, Offset: 1 },
          EndPosition: { Col: 2, Line: 1, Offset: 1 },
          Roles: ['a', 'c'],
          InternalType: 'bar'
        }
      ]
    };

    shouldMatchSnapshot(<Node tree={node} depth={0} />);
  });

  it('when the node is selected it calls onNodeSelected', () => {
    const spy = jest.fn();
    const node = {
      StartPosition: { Col: 2, Line: 2, Offset: 1 },
      EndPosition: { Col: 6, Line: 2, Offset: 6 }
    };
    const wrapper = mount(<Node tree={node} onNodeSelected={spy} />);

    wrapper.find(StyledItem).first().simulate('mousemove');
    expect(spy.mock.calls.length).toBe(1);
    const { line, ch } = spy.mock.calls[0][0];
    expect(line).toBe(1);
    expect(ch).toBe(1);
  });
});
