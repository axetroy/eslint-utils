import { isBooleanExpression, isBooleanTypeAnnotation, isFunctionReturnBoolean } from './boolean'
import { isInControlFlow } from './checker/isInControlFlow'
import { isFunctionCall } from './checker/isFunctionCall'

module.exports = {
    isBooleanExpression,
    isBooleanTypeAnnotation,
    isFunctionReturnBoolean,
    isInControlFlow,
    isFunctionCall
}
