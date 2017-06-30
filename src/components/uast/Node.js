import React, { Component } from 'react';
import styled from 'styled-components';
import { font, border, background } from '../../styling/variables';

const INDENT_SIZE = 20;
const WHITE_SPACE = 5;
const LINE_HEIGHT  = 29;

const PROPERTY_VALUE_SEPARATOR = '\':\'';
const STRING_LIMITER = '\'\\27\'';
const COLLAPSIBLE_COLLAPSED = '\'+\'';
const COLLAPSIBLE_EXTENDED = '\'-\'';

const StyledItem = styled.div`
  margin-left: ${INDENT_SIZE}px;
  min-width: 400px;
  background: ${props => props.highlighted ? background.highlight : 'none'};
`;

const StyledTitle = styled.div`
  min-height: ${LINE_HEIGHT}px;

  &::before {
    content: '';
    width: 15px;
    display: inline-block;
  }
`;

const StyledCollapsibleTitle = StyledTitle.extend`
  cursor: pointer;

  &::before {
    content: ${props => props.collapsed ? COLLAPSIBLE_COLLAPSED : COLLAPSIBLE_EXTENDED};
    color: ${props => props.collapsed ? font.color.accentDark : font.color.accentLight};
  }

  &:hover > span {
    border-bottom: 1px dashed ${border.light};
  }
`;

const StyledCollapsibleContent = styled.div`
  display: ${props => props.collapsed ? 'none' : 'block'};
  border-left: 1px solid ${border.smooth};
  margin-left: 4px;
`;

const StyledLabel = styled.summary`
  display: inline;
  font-family: ${font.family.prose};
  color: ${font.color.light};
`;

const StyledValue = styled.span`
  color: ${
    props => props.type === 'number' || props.type === 'object'
      ? font.color.accentDark
      : props.type === 'string' ? font.color.accentLight : font.color.dark
    };

  &::before{
    content: ${props => props.type === 'string' ? STRING_LIMITER : ''};
  }

  &::after {
    content: ${props => props.type === 'string' ? STRING_LIMITER : ''};
  }
`;

const StyledPropertyName = styled.span`
  margin-right: ${WHITE_SPACE}px;

  &::after {
    content: ${PROPERTY_VALUE_SEPARATOR};
    color: ${font.color.light};
  }
`;

function Value({value}) {
  return (
    <StyledValue type={typeof value}>{ value !== null ? value : 'null'}</StyledValue>
  );
}

function Label({name}) {
  return (
    <StyledLabel>{name}</StyledLabel>
  );
}

function PropertyName({name}) {
  return (
    name
      ? <StyledPropertyName>{name}</StyledPropertyName>
      : null
  );
}

export default class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: false
    }
    this.props.onMount(this);
  }

  selectedNodeTrigger(e) {
    let from, to;
    if (this.start && this.start.Line && this.start.Col) {
      from = {
        line: this.start.Line - 1,
        ch: this.start.Col - 1
      };
    }

    if (this.end && this.end.Line && this.end.Col) {
      to = {
        line: this.end.Line - 1,
        ch: this.end.Col - 1
      };
    }

    this.props.onNodeSelected(from, to);
    e.stopPropagation();
  }

  get start() {
    return this.props.tree.StartPosition;
  }

  get end() {
    return this.props.tree.EndPosition;
  }

  highlight() {
    this.setState({ highlighted: true });
  }

  unHighlight() {
    this.setState({ highlighted: false });
  }

  render() {
    const {tree, onNodeSelected, onMount} = this.props;

    return (
      <CollapsibleItem
        label="Node"
        onNodeSelected={this.selectedNodeTrigger.bind(this)}
        highlighted={this.state.highlighted}
      >
        <Property name="internal_type" value={tree.InternalType} />
        <Properties properties={tree.Properties} />
        <Children children={tree.Children} onNodeSelected={onNodeSelected} onMount={onMount} />
        <Property name="token" value={tree.Token} />
        <Position name="start_position" position={tree.StartPosition} />
        <Position name="end_position" position={tree.EndPosition} />
        <Roles roles={tree.Roles} />
      </CollapsibleItem>
    );
  }
}

function Properties({ properties }) {
  if (properties && Object.keys(properties).length > 0) {
    return (
      <CollapsibleItem name="properties" label="map<string, string>">
        {
          Object.keys(properties)
            .map((name, i) => <Property key={i} name={name} value={properties[name]} />)
        }
      </CollapsibleItem>
    );
  }

  return null;
}

function Property({ name, value }) {
  if (typeof value !== "undefined") {
    return (
      <StyledItem>
        <StyledTitle>
          { name ? <PropertyName name={name} /> : null}
          <Value value={value} />
        </StyledTitle>
      </StyledItem>
    )
  }

  return null;
}

function Children({ children, onNodeSelected, onMount }) {
  if (Array.isArray(children)) {
    return (
      <CollapsibleItem name="children" label="[]Node">
        {children.map((node, i) => (
          <Node key={i} tree={node} onNodeSelected={onNodeSelected} onMount={onMount} />
        ))}
      </CollapsibleItem>
    );
  }

  return null;
}

function coordinates(position) {
  if (!position) {
    return [];
  }

  const values = ['Offset', 'Line', 'Col'];

  return values
     .filter(name => typeof position[name] !== 'undefined')
     .map((name, i) => <Property key={i} name={name.toLowerCase()} value={position[name]} />);
}

function Position({ name, position }) {
  const coords = coordinates(position);
  if (position && coordinates.length > 0) {
    return (
      <CollapsibleItem name={name} label="Position">
        { coords }
      </CollapsibleItem>
    );
  }

  return (
    <Property name={name} value={null} />
  );
}

function Roles({ roles }) {
  if (Array.isArray(roles)) {
    return(
      <CollapsibleItem name="roles" label="[]Role">
        {roles.map((role, i) => <Property key={i} value={role} />)}
      </CollapsibleItem>
    );
  }

  return null;
}

export class CollapsibleItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const { name, label, children, onNodeSelected, highlighted } = this.props;
    return (
      <StyledItem onMouseMove={onNodeSelected} highlighted={highlighted}>
        <StyledCollapsibleTitle
          collapsed={this.state.collapsed}
          onClick={this.toggle.bind(this)}
        >
          <PropertyName name={name} />
          <Label name={label} />
        </StyledCollapsibleTitle>
        <StyledCollapsibleContent collapsed={this.state.collapsed}>
          {children}
        </StyledCollapsibleContent>
      </StyledItem>
    );
  }
}
