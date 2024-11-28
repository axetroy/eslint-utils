import { Rule } from 'eslint'
import { Node } from 'estree'

/**
 * Inserts text after the line of the given node.
 * @param fixer
 * @param node
 * @param text
 */
export declare function insertTextAfterLine(fixer: Rule.Fix, node: Node, text: string): Generator<never, void, unknown>
