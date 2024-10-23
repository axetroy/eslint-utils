import { SourceCode } from 'eslint'
import { Node } from 'estree'

/**
 * Check if the node is a boolean expression.
 * @param sourceCode
 * @param node
 */
export declare function isBooleanExpression(sourceCode: SourceCode, node: Node): boolean

/**
 * Check if the annotation is a boolean type annotation.
 * @param annotation
 */
export declare function isBooleanTypeAnnotation(annotation: any): boolean

/**
 * Check if the node is a function return boolean.
 * @param sourceCode
 * @param node
 */
export declare function isFunctionReturnBoolean(sourceCode: SourceCode, node: Node): boolean
