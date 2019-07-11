import {column} from 'gripe'


export default (obj = {}, fieldNames = ['id']) => {
  for (let fieldName of fieldNames)
    obj[fieldName] = root => column.uid.encode(root[fieldName])

  return obj
}
