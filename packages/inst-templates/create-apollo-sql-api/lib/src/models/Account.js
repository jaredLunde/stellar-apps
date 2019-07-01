import Model from './Model'
import {Gripe, column as col} from 'gripe'


export default class Account extends Gripe(
  Model, {
    id: col.uid(),
    email: col.email({required: true}),
    password: col.password({required: true}),
    key: col.string(),
    joinIp: col.string({required: true}),
    lastIp: col.string({required: true}),
    oauthProviders: col.array(col.string()),
    activated: col.bool(),
    createdAt: col.timestamp(),
    numDecks: col.int(),
  }
) {
  static tableName = 'account'
  static relationMappings = {
    decks: {
      relation: Model.HasManyRelation,
      modelClass: require('~/models/Deck').default,
      join: {
        from: 'account.id',
        to: 'deck.owner'
      }
    }
  }
}
