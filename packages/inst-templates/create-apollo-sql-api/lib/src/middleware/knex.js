import Knex from 'knex'
import {knexSnakeCaseMappers} from 'objection'
import Model from '../models/Model'


export let knex
// Initialize knex.
export default (req, res, next) => {
  knex = Knex({
    client: 'pg',
    ...req.config.db,
    searchPath: req.config.db.searchPath.split(','),
    ...knexSnakeCaseMappers()
  })

  Model.knex(knex)
  req.knex = knex
  next()
}