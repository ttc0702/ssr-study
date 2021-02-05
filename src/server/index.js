import express from 'express'
import proxy from 'express-http-proxy'
import { render } from './utils'
import { getStore } from '../store'
// 使用 react-router-config 中的 matchRoutes 解决多级路由路径匹配的问题
// 如果使用 react-router-dom 默认提供的 matchPath，则访问多级路由时，仅第一级会被 push 进 matchedRoutes 中，导致后面层级的 loadData 无法被执行，数据无法被初始化
import { matchRoutes } from "react-router-config"
import Routes from '../router'

const app = express()
// express 发现浏览器请求静态文件时，自动到 public 目录下寻找
app.use(express.static('public'))

app.use('/api',proxy('http://47.95.113.63', {
  proxyReqPathResolver: function (req) {
    // req.url = news.json
    // proxyReqPathResolver = /ssr/api/news.json
    // 最终会代理到 http://47.95.113.63 + proxyReqPathResolver
    return '/ssr/api' + req.url
  }
}));

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