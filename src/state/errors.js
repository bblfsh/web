export const initialState = [];

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
      if (action.errorType) {
        return state.filter(e => e.type !== action.errorType);
      }
      return [];
    default:
      return state;
  }
};

function error(obj, type) {
  return {
    type,
    message: obj.toString(),
  };
}

function convertErrors(errors, type) {
  // it's hard to make sure that errors is an array on higher level
  if (!Array.isArray(errors)) {
    errors = [errors];
  }
  return errors.filter(e => !!e).map(e => error(e, type));
}

export const add = (errors, type) => ({
  type: ADD,
  errors: convertErrors(errors, type),
});

export const set = (errors, type) => ({
  type: SET,
  errors: convertErrors(errors, type),
});

export const remove = idx => ({
  type: REMOVE,
  idx,
});

export const clear = type => ({
  type: CLEAR,
  errorType: type,
});
