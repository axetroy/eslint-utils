/**
 * Check if a node is a function call with the given target name
 * @param {import('estree').Node} node
 * @param {string} target
 * @param {Object} [options]
 * @param {number} [options.argCount]
 * @param {number} [options.minArgCount]
 * @param {number} [options.maxArgCount]
 * @returns {boolean}
 * @example
 * ```js
 * isFunctionCall(node, 'foo', { argCount: 2 }) // true if node is `foo(1, 2)`
 * isFunctionCall(node, 'bar.foo()') // true if node is `bar.foo()`
 * isFunctionCall(node, 'foo', { minArgCount: 2 }) // true if node is `foo(1, 2, 3)`
 * isFunctionCall(node, 'foo', { maxArgCount: 2 }) // true if node is `foo(1)` or `foo(1, 2)`
 * isFunctionCall(node, '*.foo', { maxArgCount: 2 }) // true if node is `bar.foo(1, 2)` or `baz.foo(1, 2)`
 * ```
 */
function isFunctionCall(node, target, options) {
    if (node.type !== 'CallExpression') return false

    const targetParts = target.split('.')

    if (targetParts.length === 1) {
        return node.callee.type === 'Identifier' && node.callee.name === target
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

        if (part === '*') {
            return matchesTarget(callee, parts)
        }

        if (callee.type === 'Identifier') {
            return callee.name === part && parts.length === 0
        } else if (callee.type === 'MemberExpression') {
            return callee.property.type === 'Identifier' && callee.property.name === part && matchesTarget(callee.object, parts)
        }

        return false
    }

    const isTargetMatch = matchesTarget(node.callee, targetParts)

    if (isTargetMatch && options) {
        const { argCount, minArgCount, maxArgCount } = options
        const argsLength = node.arguments.length

        if (argCount !== undefined && argsLength !== argCount) return false
        if (minArgCount !== undefined && argsLength < minArgCount) return false
        if (maxArgCount !== undefined && argsLength > maxArgCount) return false
    }

    return isTargetMatch
}

module.exports = { isFunctionCall }
