import { CHANGE_HOME_LIST } from './actionTypes'

const defaultState = {
  name: 'rayar',
  newsList: [],
  login: false,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_HOME_LIST:
      return {
        ...state,
        newsList: action.list
      }
    default:
      return state
  }
}