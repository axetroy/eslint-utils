import { SourceCode } from 'eslint'
import { Node } from 'estree'

/**
 * Get the text of a node
 * @param sourceCode
 * @param node
 */
export declare function getText(sourceCode: SourceCode, node: Node): string
