/**
 * Determines whether a node is a function call that returns a Boolean value.
 * @param {import('estree').Node} node
 * @returns
 */
function isFunctionCallThatReturnsString(node) {
    if (node.type !== 'CallExpression') return false

    return (
        // Static methods
        isFunctionCall(node, 'String', { maxArgCount: 1 }) ||
        isFunctionCall(node, 'JSON.stringify', { argCount: 1 }) ||
        // TODO: track literal method call
        // e.g. `/test/.test(str)` should return String
        (node.parent.type === 'TSAsExpression' && isStringTypeAnnotation(node.parent.typeAnnotation))
    )
}

/**
 * Check if a node is a string
 * @param {import('estree').Expression} node
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('eslint').SourceCode} [depth]
 */
function isStringExpression(node, sourceCode, depth = 0) {
    if (!node) return false

    if (depth === 3) {
        return false
    }

    if (node.type === 'Literal') {
        return typeof node.value === 'string'
    }

    if (node.type === 'TemplateLiteral') {
        return true
    }

    if (node.type === 'Identifier') {
        const scope = sourceCode.getScope(node)

        const variable = scope.variables.find(variable => variable.name === node.name)

        if (!variable) {
            return false
        }

        // Determine whether the currently referenced variable is a Boolean type.
        return variable.defs.some(definition => {
            if (definition.type === 'Variable') {
                return isStringExpression(definition.node.init, sourceCode, depth + 1) || isStringTypeAnnotation(definition.node.id.typeAnnotation)
            }

            if (definition.type === 'Parameter') {
                return isStringTypeAnnotation(definition.name.typeAnnotation)
            }

            return false
        })
    }

    if (node.type === 'BinaryExpression') {
        return isStringExpression(node.left, sourceCode) || isStringExpression(node.right, sourceCode)
    }

    if (node.type === 'AwaitExpression' || node.type === 'YieldExpression') {
        return isStringExpression(node.argument)
    }

    if (node.type === 'NewExpression') {
        return node.callee.type === 'Identifier' && node.callee.name === 'String'
    }

    if (node.type === 'CallExpression') {
        const { callee } = node

        if (isFunctionCallThatReturnsString(node)) {
            return true
        }

        if (callee.type === 'Identifier') {
            const scope = sourceCode.getScope(node.callee)

            const variable = scope.variables.find(variable => variable.name === callee.name)

            if (!variable) {
                return false
            }

            // Determine whether the currently called function returns a String type.
            return variable.defs.some(definition => {
                if (definition.type === 'Variable') {
                    return (
                        ['FunctionExpression', 'ArrowFunctionExpression'].includes(definition.node.init?.type) &&
                        isFunctionReturnString(definition.node.init, sourceCode)
                    )
                }

                if (definition.type === 'FunctionName') {
                    return isFunctionReturnString(definition.node, sourceCode)
                }

                if (definition.type === 'Parameter') {
                    return isFunctionReturnString(definition.node, sourceCode)
                }

                return false
            })
        }

        return false
    }

    if (node.type === 'SequenceExpression') {
        return isStringExpression(node.expressions.at(-1), sourceCode)
    }

    if (node.type === 'AssignmentExpression') {
        return isStringExpression(node.right, sourceCode)
    }

    if (node.type === 'TSAsExpression') {
        return isStringTypeAnnotation(node.typeAnnotation)
    }

    return false
}

function isStringTypeAnnotation(annotation) {
    if (!annotation) return false

    const typeAnnotation = annotation.typeAnnotation ?? annotation

    // @typescript-eslint/-parser
    if (typeAnnotation.type === 'TSStringKeyword') {
        return true
    }

    // babel-eslint
    if (typeAnnotation.type === 'StringTypeAnnotation') {
        return true
    }

    return false
}

/**
 * Determine whether it is a String return
 *
 * @param {import('estree').Function} node
 * @param {import('eslint').SourceCode} sourceCode
 * @returns
 */
function isFunctionReturnString(node, sourceCode) {
    return isStringTypeAnnotation(node.returnType) || isStringExpression(node.body, sourceCode)
}

module.exports = { isStringExpression, isFunctionReturnString, isStringTypeAnnotation }
