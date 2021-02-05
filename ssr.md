# 简介

### CSR（Client Side Render） 

CSR 模式的网页内容由加载的 js 文件渲染出来的，而不是服务器返回的。

流程：

1. 浏览器发送请求
2. 服务器返回 HTML
3. 浏览器发送 bundle.js 请求
4. 服务器返回 bundle.js
5. 浏览器执行 bundle.js 中的 React 代码

优势：

1. 前后端分离，提升开发效率
2. 代码在浏览器上执行，服务器压力小。

劣势：

1. TTFP（首屏展示时间） 过长
2. 不支持 SEO

### SSR（Service Side Render）

流程：

1. 浏览器发送请求
2. 服务器运行 React 代码生成页面
3. 服务器返回页面



# 同构

同构指一套代码，在服务器端执行一次，在客户端再执行一次。

因为服务器返回的 HTML 代码是字符串格式，不带事件绑定。所以业务代码需要在浏览器端再执行一次，才能使其中的事件绑定生效。

流程：

1. 服务器端运行 React 代码生成 HTML
2. 将 HTML 返回给浏览器
3. 浏览器接收 HTML 并展示
4. 浏览器加载 js 文件，js 中同构的 React 代码在浏览器端重新执行
5. js 中的 React 代码接管页面操作



# 路由

流程：

1. 服务器端运行 React 代码生成 HTML
2. 将 HTML 返回给浏览器
3. 浏览器接收 HTML 并展示
4. 浏览器加载 js 文件，js 中同构的 React 代码在浏览器端重新执行
5. js 中的 React 代码接管页面操作
6. js 代码拿到浏览器上的地址，根据地址返回不同的路由内容

React 同构项目中，**只有浏览器第一次请求页面时会进行服务器端渲染**，后面在页面中进行路由跳转时等操作时，页面是被前端代码接管的。



# 架构

使用 SSR 技术后的软件架构一般分为三层：

1. 浏览器：负责数据展示，执行 js 代码
2. node 服务器（中间层）：从 java 服务器获取数据，和 React 组件做结合，生成页面内容
3. java 服务器：负责数据的查询和计算

分层明确的好处：便于调错，哪一层出的问题，就修改那一层。



# Redux

注意：按照以前的写法，SSR 中服务器端的 store 是所有用户共用的，我们需要让服务器端每个用户的 store 是独立的。

可以将 store 写成方法导出，

```js
// /store/index.js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'

// const store = createStore(reducer, applyMiddleware(thunk))
const getStore = () => {
  return createStore(reducer, applyMiddleware(thunk))
}

// export default store
export default getStore
```

```js
// /server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../router'
import { Provider } from 'react-redux'
import getStore from '../store'

export const render = (req) => {
  const store = getStore()

  const content = renderToString(
    // 每个用户访问页面时，getStore 都会执行一次，保证服务器端每个用户的 store 是独立的
    <Provider store={store}>
      <StaticRouter location={req.path} context={{}}>
        {Routes}
      </StaticRouter>
    </Provider>
  )

  return `
    <html>
      <head>
        <title>change the world</title>
      </head>
      <body>
        <div id="root">${content}</div>
        <script src="/index.js"></script>
      </body>
    </html>
    `
}
```



# 异步数据

因为 componentDidMount() 在服务器端不会被执行，数据无法被初始化，所以需要另一种方法来初始化页面数据，可以在服务器端 index.js 文件中，通过 store 统一管理数据，再将路由改造为数组形式，根据路由，往 store 中加数据。

```js
// /server/index.js
import express from 'express'
import { render } from './utils'
import { getStore } from '../store'
// 使用 react-router-config 中的 matchRoutes 解决多级路由路径匹配的问题
// 如果使用 react-router-dom 默认提供的 matchPath，则访问多级路由时，仅第一级会被 push 进 matchedRoutes 中，导致后面层级的 loadData 无法被执行，数据无法被初始化
import { matchRoutes } from "react-router-config";
import Routes from '../router'

const app = express()
// express 发现浏览器请求静态文件时，自动到 public 目录下寻找
app.use(express.static('public'))

app.get('*', function (req, res) {
  const store = getStore()

  // 根据路由，往 store 中加数据
  const matchedRoutes = matchRoutes(Routes, req.path)

  // Routes.some(route => {
  //   const match = matchPath(req.path, route);
  //   if (match) {
  //     matchedRoutes.push(route)
  //   }
  // });

  let promises = []
  matchedRoutes.map(item => {
    if (item.route.loadData) {
      promises.push(item.route.loadData(store))
    }
  })

  Promise.all(promises)
    .then(() => {
      res.send(render(req, store, Routes))
    })
})

const server = app.listen(3000)
```

```js
// /router/index.js
import React from 'react'
import { Route } from 'react-router-dom'
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
```

```js
// /store/actions.js
import axios from 'axios'
import { CHANGE_HOME_LIST } from './actionTypes'

const changeList = (list) => ({
  type: CHANGE_HOME_LIST,
  list
})

const getHomeList = () => {
  return (dispatch) => {
    // 注意这里要将 Promise 返回，以便在 /server/index.js 中通过 Promise.all() 调用
    return axios.get('http://47.95.113.63/ssr/api/news.json?secret=abc')
      .then(res => {
        dispatch(changeList(res.data))
      })
      .catch(e => {
        console.log(e)
      })
  }
}
```

```js
// /pages/home/index.js
import React, { Component } from 'react'
import Header from '../../components/header'
import { connect } from 'react-redux'
import { getHomeList } from '../../store/actions'

class Home extends Component {
  // componentDidMount() 在服务器端不会被执行
  componentDidMount() {
    if (!this.props.newsList.length) {
      this.props.getHomeList()
    }
  }

  render() {
    return (
      <div>
        <Header />
        <div>Home</div>
        {
          this.props.newsList.map(item => {
            return (
              <div key={item.id}>{item.title}</div>
            )
          })
        }
        <button onClick={() => alert('click')}>{this.props.name}</button>
      </div>
    )
  }
}

// 这个函数，负责在服务器端渲染之前，把这个路由需要的数据提前加载好。
Home.loadData = (store) => {
  return store.dispatch(getHomeList())
}

const mapStateToProps = state => ({
  name: state.name,
  newsList: state.newsList
})

const mapDispatchToProps = dispatch => ({
  getHomeList() {
    dispatch(getHomeList())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
```

### 数据脱水和注水

数据注水：服务器在直出组件的同时，还要将数据传递给客户端。

具体实现是在返回给客户端的 html 中加一个 script 标签，将获取的数据写入到 window.context 中，这样客户端初始化 store 时可以从 window.context 中获取服务器端 store 的数据，避免闪屏。

闪屏：虽然服务器端返回的 html 中已经有数据，但客户端 js 接管页面后的 store 会被初始化为空数组，此时页面中没有数据供展示，发起 ajax 请求，获取到数据后，store 中才有数据，由此导致屏幕会闪一下。

数据脱水：客户端在渲染页面之前，用服务器端注入到 html 中的数据初始化页面数据。

```js
// /server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'


export const render = (req, store, Routes) => {
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path} context={{}}>
        {/* {Routes} */}
        <div>
          {
            Routes.map(route => (
              <Route key={route.key} {...route} />
            ))
          }
        </div>
      </StaticRouter>
    </Provider>
  )

  // 数据注水：服务器端将通过异步请求获取的数据注入到 html 中，返回给客户端。
  // 具体实现是在返回给客户端的 html 中加一个 script 标签，将获取的数据写入到 window.context 中，这样客户端初始化 store 时可以从 window.context 中获取服务器端 store 的数据，避免闪屏。
  // 闪屏：虽然服务器端返回的 html 中已经有数据，但客户端 js 接管页面后的 store 会被初始化为空数组，此时页面中没有数据供展示，发起 ajax 请求，获取到数据后，store 中才有数据，由此导致屏幕会闪一下。
  return `
    <html>
      <head>
        <title>change the world</title>
      </head>
      <body>
        <div id="root">${content}</div>
        <script>
          window.context = {
            state: ${JSON.stringify(store.getState())}
          }
        </script>
        <script src="/index.js"></script>
      </body>
    </html>
    `
}
```

```js
// /store/index.js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'

// const store = createStore(reducer, applyMiddleware(thunk))
const getStore = () => {
  return createStore(reducer, applyMiddleware(thunk))
}

const getClientStore = () => {
  // 数据脱水
  const defaultState = window.context.state
  return createStore(reducer, defaultState, applyMiddleware(thunk))
}

// export default store
export {
  getStore,
  getClientStore
}
```

