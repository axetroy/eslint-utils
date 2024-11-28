const { isInControlFlow, isFunctionCall, isNodeEqual, isLiteral, isBooleanExpression, isBooleanExpressionFunction } = require('./checker')
const { replaceVariableName, replaceText, insertImportDeclaration } = require('./fixer')
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
    insertImportDeclaration,
    // ast
    getText,
    // annotation
    isBooleanAnnotation
}
