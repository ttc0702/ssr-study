import axios from 'axios'
import { CHANGE_HOME_LIST } from './actionTypes'
// import clientAxios from '../client/request'
// import serverAxios from '../server/request'

const changeList = (list) => ({
  type: CHANGE_HOME_LIST,
  list
})

const getHomeList = (server) => {
  // 浏览器运行
  // /api/news.json => http://localhost:3000/api/news.json
  // 服务器运行
  // /api/news.json => 服务器根目录下 /api/news.json
  // const url = server ? 'http://47.95.113.63/ssr/api/news.json?secret=abc' : '/api/news.json?secret=abc'
  // const axiosInstance = server ? serverAxios : clientAxios
  return (dispatch, getState, axiosInstance) => {
    // 注意这里要将 Promise 返回，以便在 /server/index.js 中通过 Promise.all() 调用
    // return axios.get(url)
    return axiosInstance.get('/api/news.json?secret=abc')
      .then(res => {
        res.data = [
          {
            id: 1,
            title: '如何看待台湾脱口秀称「把瘦肉精猪做成肉松卖给大陆」后，国台办宣布严禁台湾肉制品输入？'
          },
          {
            id: 2,
            title: '如何看待美股 2021 年 1 月游戏驿站上 Wallstreetbets 和空头的大战？'
          },
          {
            id: 3,
            title: '我不太明白为什么要买房，每个月租 2 、 3 千的房子不是挺好的吗？'
          }
        ]
        dispatch(changeList(res.data))
      })
      .catch(e => {
        console.log(e)
      })
  }
}

export {
  getHomeList,
}