import { isInControlFlow } from './checker/isInControlFlow'
import { isFunctionCall } from './checker/isFunctionCall'
import { isNodeEqual } from './checker/isNodeEqual'
import { isLiteral } from './checker/isLiteral'
import { isBooleanExpression } from './checker/boolean'
import { replaceVariableName } from './fixer/replaceVariableName'
import { replaceText } from './fixer/replaceText'
import { getText } from './ast/getText'

module.exports = {
    // checker
    isInControlFlow,
    isFunctionCall,
    isNodeEqual,
    isLiteral,
    isBooleanExpression,
    // fixer
    replaceVariableName,
    replaceText,
    // ast
    getText
}
