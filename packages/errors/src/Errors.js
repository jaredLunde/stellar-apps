import React from 'react'
import PropTypes from 'prop-types'
import {Box, Text} from 'curls'
import {Alerts} from '@jaredlunde/curls-addons'


const ErrorsContext = React.createContext()
export const ErrorsConsumer = ErrorsContext.Consumer

export class ErrorsProvider extends React.Component {
  static defaultProps = {
    formatter: formatErrors,
  }

  static propTypes = {
    formatter: PropTypes.func
  }

  state = {
    errors: [],
    setErrors: nextErrors => {
      this.setState((state, props) => {
        if (typeof nextErrors === 'function') {
          nextErrors = nextErrors(state, props)
        }

        let errors = this.props.formatter(nextErrors)
        return {errors: Array.isArray(errors) ? errors : [errors]}
      })
    }
  }

  render () {
    return (
      <ErrorsContext.Provider value={this.state}>
        {this.props.children}
      </ErrorsContext.Provider>
    )
  }
}

export function ErrorBox ({n, id, code, message, ...props}) {
  return (
    <Box
      flex
      as='li'
      wrap='no'
      align='center'
      p='3'
      m='3'
      bw='2'
      br='1'
      bc='red'
      bg='white'
      key={id || n}
      w='90%'
      maxW='600'
      {...props}
    >
      {n === 0 && (
        <Text size='xs' color='red' m='r2'>
          Close
        </Text>
      )}

      <Text center size='xs' semiBold fluid color='red'>
        {message}
      </Text>
    </Box>
  )
}

export function formatErrors (errors) {
  if (Array.isArray(errors)) {
    return errors.map(err => formatErrors(err))
  }
  else if (typeof errors === 'string') {
    const jsonErrors = errors.split(': json:')

    if (jsonErrors.length > 1) {
      return formatErrors(JSON.parse(jsonErrors[1]))
    }

    return {message: errors.replace(/^GraphQL error: /, '')}
  }
  else if (errors.message !== void 0){
    return formatErrors(errors.message)
  }
  else {
    return errors
  }
}


export default function Errors ({errorBox = ErrorBox, ...props}) {
  return <ErrorsConsumer children={
    ({errors}) => Alerts({alerts: errors, alertBox: errorBox, ...props})
  }/>
}