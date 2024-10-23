const { isInControlFlow, isFunctionCall, isNodeEqual, isLiteral, isBooleanExpression, isBooleanExpressionFunction } = require('./checker')
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
    isBooleanExpressionFunction,
    // fixer
    replaceVariableName,
    replaceText,
    // ast
    getText,
    // annotation
    isBooleanAnnotation
}
