import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

const Header = (props) => {
  return (
    <div>
      <Link to="/">Home</Link>
      <br />
      {
        props.login ?
          <React.Fragment>
            <Link to="/login">Logout</Link>
            <br />
            <Link to="/login">翻译列表</Link>
          </React.Fragment> :
          <Link to="/login">Login</Link>
      }
    </div>
  )
}

const mapState = (state) => ({
  login: state.login
})

export default connect(mapState, null)(Header)