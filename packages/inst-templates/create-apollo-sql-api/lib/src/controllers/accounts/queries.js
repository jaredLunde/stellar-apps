import {Account} from '../../models'


export const applyFilters  = () => {
}

export const select = () => {

}

export const get = id => {
  return Account.query().findById(id)
}

export const getByEmail = email => {
  return Account.query().findOne({email})
}
