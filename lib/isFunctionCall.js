/**
 * Determines if a node is a method call to a specific target
 * @param {import('estree').Node} node
 * @param {string} target
 * @param {{ argCount, minArgCount, maxArgCount }} [options]
 */
function isFunctionCall(node, target, { argCount, minArgCount, maxArgCount } = {}) {
    if (node.type !== 'CallExpression') return false

    const targetParts = target.split('.')

    // Validate the argument count
    if (argCount) {
        if (node.arguments.length !== argCount) return false
    }
    if (minArgCount) {
        if (node.arguments.length < minArgCount) return false
    }
    if (maxArgCount) {
        if (node.arguments.length > maxArgCount) return false
    }

    /**
     * Recursively checks if the callee matches the target parts
     * @param {import('estree').Node} callee
     * @param {string[]} parts
     * @returns {boolean}
     */
    function matchesTarget(callee, parts) {
        if (parts.length === 0) return true
        const part = parts.pop()

        if (callee.type === 'Identifier') {
            return callee.name === part && parts.length === 0
        } else if (callee.type === 'MemberExpression') {
            return callee.property.name === part && matchesTarget(callee.object, parts)
        }

        return false
    }

    return matchesTarget(node.callee, targetParts)
}

module.exports = { isFunctionCall }
