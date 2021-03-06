import {column} from 'gripe'


export default (...fields) => {
  fields = ['id', ...fields]
  return fn => (root, args, context, info) => {
    args = {...args}

    for (let field of fields)
      if (args.hasOwnProperty(field))
        args[field] = column.uid.decode(args[field])

    return fn(root, args, context, info)
  }
}