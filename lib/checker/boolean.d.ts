import { SourceCode } from 'eslint'
import { Node } from 'estree'

/**
 * Check if the node is a boolean expression.
 * @param sourceCode
 * @param node
 */
export declare function isBooleanExpression(sourceCode: SourceCode, node: Node): boolean

/**
 * Check if the node is a function return boolean.
 * @param sourceCode
 * @param node
 */
export declare function isBooleanExpressionFunction(sourceCode: SourceCode, node: Node): boolean
