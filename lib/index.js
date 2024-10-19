import { isBooleanExpression, isBooleanTypeAnnotation, isFunctionReturnBoolean } from './boolean'
import { isInControlFlow } from './checker/isInControlFlow'
import { isFunctionCall } from './checker/isFunctionCall'
import { insertTextAfterLine } from './fixer/insertTextAfterLine'
import { replaceVariableName } from './fixer/replaceVariableName'

module.exports = {
    isBooleanExpression,
    isBooleanTypeAnnotation,
    isFunctionReturnBoolean,
    // checker
    isInControlFlow,
    isFunctionCall,
    // fixer
    insertTextAfterLine,
    replaceVariableName
}
