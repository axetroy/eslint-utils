/**
 * Replace the text of the given node with the given text.
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Node} node
 * @param {string} text
 */
function* replaceText(fixer, sourceCode, node, text) {
    if (node.type === 'UnaryExpression' && ['AwaitExpression', 'YieldExpression'].includes(node.parent?.type)) {
        // If the node is an `await` or `yield` expression, the text should be replaced with a space.

        const beforeToken = sourceCode.getTokenBefore(node)

        const isHasSpace = node.range[0] - beforeToken.range[1] > 0

        if (!isHasSpace) {
            yield fixer.insertTextAfter(beforeToken, ' ')
        }
    }

    yield fixer.replaceText(node, text)
}

module.exports = { replaceText }
