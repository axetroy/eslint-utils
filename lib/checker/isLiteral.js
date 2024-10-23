const LiteralConstructorsCanNew = new Set(['Boolean', 'String', 'Number', 'RegExp', 'BigInt'])
const LiteralConstructorsCannotNew = new Set([...LiteralConstructorsCanNew, 'Symbol'])

/**
 *
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
function isLiteral(node) {
    return (
        node.type === 'Literal' ||
        (node.type === 'CallExpression' && node.callee.type === 'Identifier' && LiteralConstructorsCannotNew.has(node.callee.name)) ||
        (node.type === 'NewExpression' && node.callee.type === 'Identifier' && LiteralConstructorsCanNew.has(node.callee.name))
    )
}

module.exports = { isLiteral }
