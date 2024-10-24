const { isFunctionCall } = require('./isFunctionCall')
const { isInControlFlow } = require('./isInControlFlow')
const { isNodeEqual } = require('./isNodeEqual')
const { isLiteral } = require('./isLiteral')
const { isBooleanExpression, isBooleanExpressionFunction } = require('./boolean')

module.exports = {
    isFunctionCall,
    isInControlFlow,
    isNodeEqual,
    isLiteral,
    isBooleanExpression,
    isBooleanExpressionFunction
}
