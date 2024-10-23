import { isInControlFlow } from './checker/isInControlFlow'
import { isFunctionCall } from './checker/isFunctionCall'
import { isNodeEqual } from './checker/isNodeEqual'
import { replaceVariableName } from './fixer/replaceVariableName'
import { replaceText } from './fixer/replaceText'
import { getText } from './ast/getText'

module.exports = {
    // checker
    isInControlFlow,
    isFunctionCall,
    isNodeEqual,
    // fixer
    replaceVariableName,
    replaceText,
    // ast
    getText
}
