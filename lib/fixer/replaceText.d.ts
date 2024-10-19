import { SourceCode, Rule } from 'eslint'
import { Node } from 'estree'

/**
 * Replaces the text of a node with the given text.
 * @param fixer
 * @param sourceCode
 * @param node
 * @param text
 */
declare function replaceText(fixer: Rule.Fix, sourceCode: SourceCode, node: Node, text: string): Generator<never, void, unknown>
