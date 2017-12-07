const initialState = [];

export const ADD = 'bblfsh/errors/ADD';
export const SET = 'bblfsh/errors/SET';
export const REMOVE = 'bblfsh/errors/REMOVE';
export const CLEAR = 'bblfsh/errors/CLEAR';

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD:
      return state.concat(action.errors || []);
    case SET:
      return action.errors || [];
    case REMOVE:
      return [...state.slice(0, action.idx), ...state.slice(action.idx + 1)];
    case CLEAR:
      return [];
    default:
      return state;
  }
};

export const add = errors => ({
  type: ADD,
  errors,
});

export const set = errors => ({
  type: SET,
  errors,
});

export const remove = idx => ({
  type: REMOVE,
  idx,
});

export const clear = () => ({
  type: CLEAR,
});
