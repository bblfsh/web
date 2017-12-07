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

  const tree = convertTree(uast);
  expect(tree).toMatchSnapshot();
});
