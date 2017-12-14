import { convertTree } from './ast';

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
