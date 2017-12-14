import NodeIndex from '../services/NodeIndex';

export const NODE_EXPAND = 'bblfsh/ast/NODE_EXPAND';
export const NODE_TOGGLE = 'bblfsh/ast/NODE_TOGGLE';
export const NODE_HIGHLIGHT = 'bblfsh/ast/NODE_HIGHLIGHT';
export const NODE_UNHIGHLIGHT = 'bblfsh/ast/NODE_UNHIGHLIGHT';

export const nodeReducer = (state, action) => {
  switch (action.type) {
    case NODE_EXPAND:
      return {
        ...state,
        expanded: true,
      };
    case NODE_TOGGLE:
      return {
        ...state,
        expanded: !state.expanded,
      };
    case NODE_HIGHLIGHT:
      return {
        ...state,
        highlighted: true,
      };
    case NODE_UNHIGHLIGHT:
      return {
        ...state,
        highlighted: false,
      };
    default:
      return state;
  }
};

export const DEFAULT_EXPAND_LEVEL = 2;
export const convertTree = uast => {
  const posIndex = new NodeIndex();
  const tree = {};
  let id = 0;

  function convertNode(uast, level, parentId) {
    const curId = ++id;

    const node = {
      ...uast,
      id: curId,
      expanded: level < DEFAULT_EXPAND_LEVEL,
      higlighted: false,
      parentId,
    };
    if (node.Children) {
      node.Children = node.Children.map(child =>
        convertNode(child, level + 1, curId)
      );
    }

    posIndex.add({
      id: node.id,
      start: node.StartPosition,
      end: node.EndPosition,
    });
    tree[curId] = node;

    return curId;
  }

  convertNode(uast, 0);
  return { tree, posIndex };
};

export const expand = nodeId => ({
  type: NODE_EXPAND,
  nodeId,
});

export const nodeHighlight = nodeId => ({
  type: NODE_HIGHLIGHT,
  nodeId,
});

export const nodeUnhighlight = nodeId => ({
  type: NODE_UNHIGHLIGHT,
  nodeId,
});
