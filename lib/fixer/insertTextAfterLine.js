/**
 * 向节点中插入下一行文本
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('estree').Node} node
 * @param {string} text
 */
function* insertTextAfterLine(fixer, node, text) {
    const nodeIndentCount = node.loc?.start.column ?? 0

    const indent = ' '.repeat(nodeIndentCount)

    yield fixer.insertTextAfter(node, '\n' + indent)

    yield fixer.insertTextAfter(node, '\n' + indent + text)
}

module.exports = { insertTextAfterLine }
