import React from 'react'
import { Route } from 'react-router-dom'
import App from '../pages/App'
import Home from '../pages/home'
import Login from '../pages/login'

// export default (
//   <div>
//     <Route path="/" component={Home} exact></Route>
//     <Route path="/login" component={Login} exact></Route>
//   </div>
// )

export default [
  {
    path: '/',
    component: App,
    loadData: App.loadData,
    routes: [
      {
        path: '/',
        component: Home,
        exact: true,
        loadData: Home.loadData,
        key: 'home',
      },
      {
        path: '/login',
        component: Login,
        exact: true,
        key: 'login',
      }
    ]
  }
]