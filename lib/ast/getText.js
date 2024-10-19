/**
 * Get the text of the node.
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Node} node
 * @returns {string}
 */
function getText(sourceCode, node) {
    if (['SequenceExpression'].includes(node.type)) {
        const before = sourceCode.getTokenBefore(node)
        const after = sourceCode.getTokenAfter(node)

        const range = [before.range[0], after.range[1]]

        return sourceCode.text.slice(range[0], range[1])
    }

    return sourceCode.getText(node)
}

module.exports = { getText }
