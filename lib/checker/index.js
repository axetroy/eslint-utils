const { isFunctionCall } = require('./isFunctionCall')
const { isInControlFlow } = require('./isInControlFlow')
const { isNodeEqual } = require('./isNodeEqual')
const { isBooleanExpression } = require('./boolean')

module.exports = {
    isFunctionCall,
    isInControlFlow,
    isNodeEqual,
    isBooleanExpression
}