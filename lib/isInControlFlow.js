/**
 * Check if a node is in a control flow
 * @param {import('estree').Node} node
 */
function isInControlFlow(node) {
    /**
     * @type {import('estree').Node}
     */
    const parent = node.parent

    const controlFlowTypes = ['IfStatement', 'WhileStatement', 'ForStatement', 'DoWhileStatement', 'ConditionalExpression']

    if (controlFlowTypes.includes(parent.type) && parent.test === node) {
        return true
    }

    if (parent.type === 'SwitchStatement') {
        return parent.discriminant === node
    }

    if (parent.type === 'LogicalExpression') {
        return isInControlFlow(parent)
    }

    return false
}

module.exports = { isInControlFlow }
