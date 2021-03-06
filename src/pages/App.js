import React from 'react'
import Header from '../components/header'
import { renderRoutes } from 'react-router-config'

const App = (props) => {
  console.log(props.route)
  return (
    <div>
      <Header />
      {renderRoutes(props.route.routes)}
    </div>
  )
}

App.loadData = (store) => {
  store.dispatch()
}

export default App