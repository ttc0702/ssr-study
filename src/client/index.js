import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import Routes from '../router'
import { Provider } from 'react-redux'
import { getClientStore } from '../store'

const App = () => {
  const store = getClientStore()
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        {/* {Routes} */}
        <div>     
          {/* {
            Routes.map(route => (
              <Route key={route.key} {...route} />
            ))
          } */}
          {renderRoutes(Routes)}
        </div>
      </BrowserRouter>
    </Provider>
  )
}

ReactDom.hydrate(<App />, document.getElementById('root'))