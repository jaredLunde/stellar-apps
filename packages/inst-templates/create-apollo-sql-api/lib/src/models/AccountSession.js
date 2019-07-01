import config from '../config'
import Model from './Model'
import {Gripe, column as col} from 'gripe'


export default class AccountSession extends Gripe(
  Model, {
    id: col.uid(),
    key: col.string({required: true}),
    token: col.encrypted({required: true, getSecret: () => config.accounts.secret}),
    createdAt: col.timestamp()
  }
) {
  static idColumn = 'key'
  static tableName = 'account_session'
  static relationMappings = {
    owner: {
      relation: Model.HasManyRelation,
      modelClass: require('~/models/Account').default,
      join: {
        from: 'account_session.key',
        to: 'account.key'
      }
    }
  }
}
