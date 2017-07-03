export default class NodeIndex {
  constructor() {
    this.index = [];
  }

  reset() {
    this.index = [];
  }

  add(node) {
    if (!node.end || !node.end.Line || !node.end.Col) {
      return;
    }

    const idx = this.index;
    if (!idx[node.start.Line]) {
      idx[node.start.Line] = [];
      idx[node.start.Line][node.start.Col] = [node];
      return;
    }

    if (!idx[node.start.Line][node.start.Col]) {
      idx[node.start.Line][node.start.Col] = [node];
      return;
    }

    idx[node.start.Line][node.start.Col].push(node);
  }

  get(position) {
    return findContainer(this.index, position.Line, position.Col)
  }
}

function findContainer(idx, targetLine, targetCol) {
  let candidate;
  let firstLookup = true;
  for (let line = targetLine; line > 0; line--) {
    if (!idx[line]) {
      continue;
    }

    candidate = findContainerInLineNodes(idx[line], targetLine, targetCol, firstLookup);
    if (candidate) {
      return candidate;
    }

    firstLookup = false;
  }
}

function findContainerInLineNodes(lineNodes, targetLine, targetCol, startFromTargetCol) {
  let candidate;
  for (let col = (startFromTargetCol ? targetCol : lineNodes.length - 1); col > 0; col--) {
    if (!lineNodes[col]) {
      continue;
    }

    candidate = findSmallerContainerInColNodes(lineNodes[col], targetLine, targetCol);
    if (candidate) {
      return candidate;
    }
  }
}

function findSmallerContainerInColNodes(columnNodes, targetLine, targetCol) {
  let candidateNode,
    closestEndLine = Number.MAX_VALUE,
    closestEndCol = Number.MAX_VALUE;

  columnNodes.forEach(node => {
    if (!hasEndPosition(node) || !endsAfter(node, targetLine, targetCol)) {
      return;
    }

    if (
      node.end.Line < closestEndLine ||
      (node.end.Line === closestEndLine && node.end.Col < closestEndCol)
    ) {
      candidateNode = node;
      closestEndLine = node.end.Line;
      closestEndCol = node.end.Col;
    }
  });

  return candidateNode;
}

function endsAfter(node, targetLine, targetCol) {
  return (
    node.end.Line > targetLine ||
    (node.end.Line === targetLine && node.end.Col > targetCol)
  );
}

function hasEndPosition(node) {
  return node.end && node.end.Line && node.end.Col;
}

export const nodeIndex = new NodeIndex();
