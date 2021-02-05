import React, { Component } from 'react'
// import Header from '../../components/header'
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
        {/* <Header /> */}
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