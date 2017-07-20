import NodeIndex from './NodeIndex';

const mkPos = (Line, Col) => ({ Line, Col });
const mkNode = (start, end, name) => ({ start, end, name });

describe('NodeIndex', () => {
  describe('add', () => {
    it('does not add a node if it has no end', () => {
      const index = new NodeIndex();
      index.add({});
      expect(index.index.length).toBe(0);
    });

    it('does not add a node if it has no end line', () => {
      const index = new NodeIndex();
      index.add({ end: { Col: 1 } });
      expect(index.index.length).toBe(0);
    });

    it('does not add a node if it has no end col', () => {
      const index = new NodeIndex();
      index.add({ end: { Line: 1 } });
      expect(index.index.length).toBe(0);
    });

    it('adds a node with a line and col', () => {
      const index = new NodeIndex();
      index.add({
        start: { Line: 1, Col: 1 },
        end: { Line: 1, Col: 1 }
      });
      expect(index.index[1][1].length).toBe(1);
    });

    it('does not add a duplicated node', () => {
      const node = {
        start: { Line: 1, Col: 1 },
        end: { Line: 1, Col: 1 }
      };
      const index = new NodeIndex();
      index.add(node);
      index.add(node);
      expect(index.index[1][1].length).toBe(1);
    });

    it('adds a node to the line if there are other nodes already', () => {
      const index = new NodeIndex();
      index.add(mkNode(mkPos(1, 1), mkPos(1, 1)));
      index.add(mkNode(mkPos(1, 2), mkPos(1, 4)));

      expect(index.index[1].length).toBe(3);
      expect(index.index[1][1].length).toBe(1);
      expect(index.index[1][2].length).toBe(1);
    });

    it('adds a node to the col if there are other nodes already', () => {
      const index = new NodeIndex();
      index.add(mkNode(mkPos(1, 1), mkPos(1, 1)));
      index.add(mkNode(mkPos(1, 1), mkPos(1, 4)));

      expect(index.index[1].length).toBe(2);
      expect(index.index[1][1].length).toBe(2);
    });
  });

  describe('get returns the specified node', () => {
    const index = new NodeIndex();
    index.add(mkNode(mkPos(1, 1), mkPos(2, 10), 'parent'));
    index.add(mkNode(mkPos(1, 2), mkPos(1, 5), 'child1'));
    index.add(mkNode(mkPos(1, 6), mkPos(2, 10), 'child2'));

    const cases = [
      { line: 1, col: 1, expected: 'parent' },
      { line: 1, col: 2, expected: 'child1' },
      { line: 1, col: 3, expected: 'child1' },
      { line: 1, col: 5, expected: 'parent' },
      { line: 1, col: 6, expected: 'child2' },
      { line: 2, col: 6, expected: 'child2' }
    ];

    cases.forEach(c => {
      it(`expecting node at ${c.line}:${c.col} to be ${c.expected}`, () => {
        const node = index.get(mkPos(c.line, c.col));
        expect(node.name).toBe(c.expected);
      });
    });
  });
});
