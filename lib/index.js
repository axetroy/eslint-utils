const { isInControlFlow, isFunctionCall, isNodeEqual, isLiteral, isBooleanExpression, isBooleanTypeAnnotation, isFunctionReturnBoolean } = require('./checker')
const { replaceVariableName, replaceText } = require('./fixer')
const { getText } = require('./ast')
const { isBooleanAnnotation } = require('./annotation')

module.exports = {
    // checker
    isInControlFlow,
    isFunctionCall,
    isNodeEqual,
    isLiteral,
    isBooleanExpression,
    isBooleanTypeAnnotation,
    isFunctionReturnBoolean,
    // fixer
    replaceVariableName,
    replaceText,
    // ast
    getText,
    // annotation
    isBooleanAnnotation
}
