import React, {useRef, useCallback, useMemo} from 'react'
import {callIfExists} from '@render-props/utils'
import Choices, {Choice} from '@render-props/choices'
import Toggle from '@render-props/toggle'
import {canTouch} from '@stellar-apps/utils'
import emptyFn from 'empty/function'
import emptyArr from 'empty/array'


/*
<Select options={['foo', 'bar]} initialValue='bar'>
  {({isOpen, value, options}) => (

  )}
</Select>
 */

const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  position: "absolute"
}

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

let ID = 0

const Select = ({label, name, choices, toggle, innerRef, children}) => {
  const
    element = useRef(null),
    selection = choices.selections[0],
    id = useMemo(() => `select-menu-${ID++}`, emptyArr)

  const show = useCallback(
    () => {
      if (canTouch() === false)
        toggle.on()
      else if (element.current?.fireEvent)
        element.current.fireEvent('onmousedown')
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
        element.current.dispatchEvent(evt)
      }
    },
    [toggle.on]
  )

  const handleSelectChange = useCallback(
    e => {
      choices.select(
        choices.choices.filter(
          c => typeof c === 'string' || !isNaN(c)
            ? c === e.target.value
            : c.value === e.target.value
        )[0]
      )
    },
    [choices.select, choices.choices]
  )

  const childContext = useMemo(
    () => ({
      show,
      hide: toggle.off,
      toggle: canTouch() === true ? show : toggle.toggle,
      isOpen: toggle.value,
      options: choices.choices,
      value: selection
    }),
    [show, toggle.off, toggle.toggle, toggle.value, choices.choices, selection]
  )

  return (
    <>
      {label && <label htmlFor={id} children={label} style={visuallyHidden}/>}
      <select
        id={id}
        name={name}
        onChange={canTouch() ? handleSelectChange : emptyFn}
        value={
          typeof selection === 'string' || !isNaN(selection)
            ? selection
            : selection.value
        }
        style={selectStyle}
        ref={el => {
          element.current = el
          callIfExists(innerRef, el)
        }}
      >
        {choices.choices.map(
          choice => React.createElement(
            'option',
            typeof choice === 'string' || !isNaN(choice)
              ? {key: choice, value: choice, children: choice}
              : Object.assign({key: choice.value}, choice)
          )
        )}
      </select>

      {children(childContext)}
    </>
  )
}

const handleChange = fn => value => callIfExists(
  fn,
  value.push === void 0 ? Array.from(value.values())[0] : value[0]
)

export const Option = Choice
export default React.forwardRef(
  (
    {
      name,
      label,
      options,
      initialValue,
      onChange,
      onVisibilityChange,
      children
    },
    innerRef
  ) => (
    <Choices
      initialChoices={options}
      initialSelections={initialValue ? [initialValue] : void 0}
      minSelections={0}
      maxSelections={1}
      onChange={handleChange(onChange)}
      onBoundMaxSelections={
        ({selections, select, deselect}) => {
          deselect(selections.shift())
          select(selections.pop())
        }
      }
    >
      {(choices) => <Toggle
        initialValue={false}
        onChange={onVisibilityChange}
        children={toggle => <Select
          label={label}
          name={name}
          choices={choices}
          toggle={toggle}
          innerRef={innerRef}
          children={children}
        />}
      />}
    </Choices>
  )
)