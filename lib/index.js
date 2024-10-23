const { isInControlFlow } = require('./checker/isInControlFlow')
const { isFunctionCall } = require('./checker/isFunctionCall')
const { isNodeEqual } = require('./checker/isNodeEqual')
const { isLiteral } = require('./checker/isLiteral')
const { isBooleanExpression } = require('./checker/boolean')
const { replaceVariableName } = require('./fixer/replaceVariableName')
const { replaceText } = require('./fixer/replaceText')
const { getText } = require('./ast/getText')

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
