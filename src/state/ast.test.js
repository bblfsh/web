import { convertTree, getNodeRootId, getSearchResults } from './ast';

it('convertTree', () => {
  const uast = {
    InternalType: 'Root',
    Children: [
      {
        InternalType: 'Child1',
        Children: [
          {
            InternalType: 'Child11',
            Children: [{ InternalType: 'Child111' }],
            StartPosition: { Col: 1, Line: 1, Offset: 1 },
            EndPosition: { Col: 1, Line: 1, Offset: 1 },
          },
          {
            InternalType: 'Child12',
          },
        ],
      },
      {
        InternalType: 'Child2',
        Children: [
          {
            InternalType: 'Child21',
          },
        ],
      },
    ],
  };

  const treeAndIndex = convertTree(uast);
  expect(treeAndIndex).toMatchSnapshot();
});

describe('getNodeRootId', () => {
  it('should return 1 with node', () => {
    expect(
      getNodeRootId({
        code: { ast: { 1: { id: 1, InternalType: 'rootNode' } } },
      })
    ).toEqual(1);
  });

  it('should return null without node', () => {
    expect(getNodeRootId({ code: { ast: null } })).toBeNull();
    expect(getNodeRootId({ code: { ast: {} } })).toBeNull();
  });
});

describe('getSearchResults', () => {
  it('should return result ids', () => {
    expect(
      getSearchResults({
        code: {
          ast: {
            1: {
              id: 1,
              InternalType: 'Dashboard: Search results',
              Children: [2, 3],
            },
          },
        },
      })
    ).toEqual([2, 3]);
  });

  it('should return null with regular uast response', () => {
    expect(
      getSearchResults({
        code: {
          ast: {
            1: {
              id: 1,
              InternalType: 'rootNode',
              Children: [2, 3],
            },
          },
        },
      })
    ).toBeNull();
  });
});
