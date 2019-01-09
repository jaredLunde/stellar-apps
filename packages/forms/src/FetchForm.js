import React from 'react'
import PropTypes from 'prop-types'
import {Formik} from 'formik'
import {callIfExists}  from '@render-props/utils'


export default class FetchForm extends React.Component {
  state = {response: null, json: null}

  static defaultProps = {
    getRequestBody: values => JSON.stringify(values),
    getRequestHeaders: () => ({})
  }

  static propTypes = {
    config: PropTypes.func,
    onSubmit: PropTypes.func,
    endpoint: PropTypes.string.isRequired,
    getRequestBody: PropTypes.func.isRequired,
    getRequestHeaders: PropTypes.func.isRequired,
  }

  onSubmit = async (values, formikBag) => {
    if (typeof this.props.confirm !== 'function' || this.props.confirm(values, formikBag)) {
      formikBag.setSubmitting(true)
      await callIfExists(this.props.onSubmit, values, formikBag)

      const response = await fetch(
        this.props.endpoint,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...this.props.getRequestHeaders(values, formikBag)
          },
          body: this.props.getRequestBody(values, formikBag)
        }
      )

      this.setState({response, json: await response.json()})
      formikBag.setSubmitting(false)
    }
  }

  render () {
    const {
      onSubmit,
      endpoint,
      getRequestBody,
      getRequestHeaders,
      children,
      ...props
    } = this.props

    return (
      <Formik onSubmit={this.onSubmit} {...props}>
        {formikBag => children({...formikBag, ...this.state})}
      </Formik>
    )
  }
}