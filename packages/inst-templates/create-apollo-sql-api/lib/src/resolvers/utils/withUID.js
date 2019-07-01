import {columns} from 'gripe'


export default (obj = {}, fieldNames = ['id']) => {
  for (let fieldName of fieldNames)
    obj[fieldName] = root => columns.uid.encode(root[fieldName])

  return obj
}
