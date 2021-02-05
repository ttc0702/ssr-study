import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import clientAxios from '../client/request'
import serverAxios from '../server/request'

// const store = createStore(reducer, applyMiddleware(thunk))
const getStore = () => {
  return createStore(reducer, applyMiddleware(thunk.withExtraArgument(serverAxios)))
}

const getClientStore = () => {
  // 数据脱水
  const defaultState = window.context.state
  return createStore(reducer, defaultState, applyMiddleware(thunk.withExtraArgument(clientAxios)))
}

// export default store
export {
  getStore,
  getClientStore
}