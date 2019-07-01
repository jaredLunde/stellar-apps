import {Model, ValidationError} from 'objection'
import {DbErrors} from 'objection-db-errors'

// NOTE: https://github.com/Vincit/objection-db-errors
//       https://github.com/griffinpp/objection-soft-delete
//       https://github.com/scoutforpets/objection-password/blob/master/index.js
//       https://github.com/snlamm/objection-dynamic-finder
export default class EngramsModel extends DbErrors(Model) {
  static idColumn = 'id'
  static recentnessColumn = 'id'

  $beforeInsert () {
    if (this.constructor.idColumn === 'id' && this[this.constructor.idColumn]) {
      throw new ValidationError({
        message: 'ID cannot not be defined before insert.',
        column: this.constructor.idColumn
      })
    }
  }

  static byNew (builder) {
    return builder.orderBy(this.recentnessColumn, 'desc')
  }

  static byOld (builder) {
    return builder.orderBy(this.recentnessColumn, 'asc')
  }
}
/**
UniqueViolationError
ConstraintViolationError
ForeignKeyViolationError
NotNullViolationError
CheckViolationError
DataError
*/
