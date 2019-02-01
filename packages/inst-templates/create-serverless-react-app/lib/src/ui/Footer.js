import React from 'react'
import {Row, Type} from 'curls'


export default class Footer extends React.Component {
  render () {
    return (
      <Row p='t3 b6' justify='center'>
        <Type>
          &copy;{(new Date()).getFullYear()}{" "}
          foo
        </Type>
      </Row>
    )
  }
}
