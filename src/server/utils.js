import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, Route } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import { Provider } from 'react-redux'


export const render = (req, store, Routes) => {
  // React 中的虚拟 dom，
  // 在客户端渲染时可以被 ReactDOM.render() 转化为真实 dom 渲染到页面上；
  // 也可以在服务端渲染时被 renderToString() 转化为字符串返回给浏览器。
  const content = renderToString(
    // 每个用户访问页面时，getStore 都会执行一次，保证服务器端每个用户的 store 是独立的
    <Provider store={store}>
      <StaticRouter location={req.path} context={{}}>
        {/* {Routes} */}
        <div>
          {/* {
            Routes.map(route => (
              <Route key={route.key} {...route} />
            ))
          } */}
          {/* renderRoutes 可以帮助渲染一级路由，并将 routes 传给二级路由的组件 */}
          {renderRoutes(Routes)}
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