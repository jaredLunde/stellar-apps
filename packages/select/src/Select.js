import React from 'react'
import {callIfExists} from '@render-props/utils'
import Choices, {Choice} from '@render-props/choices'
import Toggle from '@render-props/toggle'
import {canTouch} from '@stellar-apps/utils'
import emptyFn from 'empty/function'

/*
<Select options={['foo', 'bar]} initialValue='bar'>
  {({isOpen, value, options}) => (

  )}
</Select>
 */

const selectStyle = {
  zIndex: -1,
  position: 'absolute',
  fontSize: '1rem',
  height: 0,
  minHeight: 0,
  width: 0,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  OAppearance: 'none',
  MsAppearance: 'none',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  WebkitBoxShadow: 'none',
  MozBoxShadow: 'none',
  backgroundImage: 'none',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  appearance: 'none'
}

class Select_ extends React.Component {
  constructor (props) {
    super(props)
    this.selectContext = {
      show: this.show,
      hide: this.props.off,
      toggle: canTouch() === true ? this.show : this.props.toggle,
      select: this.props.select,
      isOpen: this.props.value,
      options: null,
      value: this.props.selection
    }
  }

  element = null

  setSelectRef = el => {
    this.element = el
    callIfExists(this.props.innerRef, el)
  }

  show = () => {
    if (canTouch() === false) {
      this.props.on()
    }
    else if (this.element.fireEvent) {
      this.element.fireEvent('onmousedown')
    }
    else {
      const evt = window.document.createEvent('MouseEvents')
      evt.initMouseEvent(
        'mousedown',
        true,
        true,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      this.element.dispatchEvent(evt)
    }
  }

  handleSelectChange = e => {
    this.props.select(
      this.props.choices.filter(
        c => typeof c === 'string' || !isNaN(c)
          ? c === e.target.value
          : c.value === e.target.value
      )[0]
    )
  }

  render () {
    this.selectContext.isOpen = this.props.value
    this.selectContext.options = this.props.choices
    this.selectContext.value = this.props.selection

    return (
      <>
        <select
          name={this.props.name}
          onChange={canTouch() ? this.handleSelectChange : emptyFn}
          value={
            typeof this.props.selection === 'string' || !isNaN(this.props.selection)
              ? this.props.selection
              : this.props.selection.value
          }
          style={selectStyle}
          ref={this.setSelectRef}
        >
          {this.props.choices.map(
            choice => React.createElement(
              'option',
              typeof choice === 'string' || !isNaN(choice)
                ? {key: choice, value: choice, children: choice}
                : {key: choice.value, ...choice}
            )
          )}
        </select>

        {this.props.children(this.selectContext)}
      </>
    )
  }
}


function handleChange (fn) {
  return function (value) {
    return callIfExists(
      fn,
      value.push === void 0 ? Array.from(value.values())[0] : value[0]
    )
  }
}

export const Option = Choice

export default React.forwardRef(
  function Select (
    {
      name,
      options,
      initialValue,
      onChange,
      onVisibilityChange,
      children
    },
    innerRef
  ) {
    return (
      <Choices
        initialChoices={options}
        initialSelections={initialValue ? [initialValue] : void 0}
        minSelections={0}
        maxSelections={1}
        onChange={handleChange(onChange)}
        onBoundMaxSelections={
          function ({selections, select, deselect}) {
            deselect(selections.shift())
            select(selections.pop())
          }
        }
      >
        {({choices, selections, select}) => <Toggle
          initialValue={false}
          onChange={onVisibilityChange}
          children={toggle => <Select_
            {...toggle}
            innerRef={innerRef}
            name={name}
            choices={choices}
            select={select}
            selection={selections[0]}
            children={children}
          />}
        />}
      </Choices>
    )
  }
)