const { isFunctionCall } = require('./isFunctionCall')

/**
 * Determines whether a node is a function call that returns a Boolean value.
 * @param {import('estree').Node} node
 * @returns
 */
function isFunctionCallThatReturnsBoolean(node) {
    if (node.type !== 'CallExpression') return false

    return (
        // Static methods
        isFunctionCall(node, 'Boolean', { maxArgCount: 1 }) ||
        isFunctionCall(node, 'Array.isArray', { argCount: 1 }) ||
        isFunctionCall(node, 'Number.isNaN', { argCount: 1 }) ||
        isFunctionCall(node, 'Number.isFinite', { argCount: 1 }) ||
        isFunctionCall(node, 'Number.isInteger', { argCount: 1 }) ||
        isFunctionCall(node, 'Number.isSafeInteger', { argCount: 1 }) ||
        isFunctionCall(node, 'Object.hasOwn', { argCount: 1 }) ||
        isFunctionCall(node, 'Object.hasOwnProperty', { argCount: 1 }) ||
        isFunctionCall(node, 'Object.is', { argCount: 1 }) ||
        isFunctionCall(node, 'Reflect.has', { argCount: 2 }) ||
        isFunctionCall(node, 'Reflect.isExtensible', { argCount: 1 }) ||
        isFunctionCall(node, 'Reflect.preventExtensions', { argCount: 1 }) ||
        isFunctionCall(node, 'Reflect.defineProperty', { argCount: 3 }) ||
        isFunctionCall(node, 'Reflect.deleteProperty', { argCount: 2 }) ||
        isFunctionCall(node, 'ArrayBuffer.isView', { argCount: 1 }) ||
        isFunctionCall(node, 'Atomics.isLockFree', { argCount: 1 }) ||
        // TODO: track literal method call
        // e.g. `/test/.test(str)` should return Boolean
        (node.parent.type === 'TSAsExpression' && isBooleanTypeAnnotation(node.parent.typeAnnotation))
    )
}

/**
 * Determines whether a node is a Boolean Expression.
 *
 * @param {import('estree').Expression} node
 * @param {import('eslint').SourceCode} sourceCode
 * @param {number} [depth]
 * @returns {boolean}
 */
function isBooleanExpression(node, sourceCode, depth = 0) {
    if (!node) {
        return false
    }

    // Prevent infinite recursion
    // This value should not be too large, otherwise there may be performance issues
    if (depth > 3) {
        return false
    }

    switch (node.type) {
        case 'Literal': {
            return typeof node.value === 'boolean'
        }

        case 'Identifier': {
            const scope = sourceCode.getScope(node)

            const variable = scope.variables.find(variable => variable.name === node.name)

            if (!variable) {
                return false
            }

            // Determine whether the currently referenced variable is a Boolean type.
            return variable.defs.some(definition => {
                if (definition.type === 'Variable') {
                    return isBooleanExpression(definition.node.init, sourceCode, depth + 1) || isBooleanTypeAnnotation(definition.node.id.typeAnnotation)
                }

                if (definition.type === 'Parameter') {
                    return isBooleanTypeAnnotation(definition.name.typeAnnotation)
                }

                return false
            })
        }

        case 'UnaryExpression': {
            return node.operator === '!'
        }

        case 'LogicalExpression': {
            return node.operator === '&&'
        }

        // Age => 18
        case 'BinaryExpression': {
            return ['>', '>=', '<', '<=', '==', '===', '!=', '!==', 'in', 'instanceof'].includes(node.operator)
        }

        // Const isAdult = age >= 18 ? true : false;
        case 'ConditionalExpression': {
            return isBooleanExpression(node.consequent, sourceCode, depth + 1) && isBooleanExpression(node.alternate, sourceCode, depth + 1)
        }

        // Await true
        case 'AwaitExpression': {
            return isBooleanExpression(node.argument, sourceCode, depth + 1)
        }

        // Yield true
        case 'YieldExpression': {
            return isBooleanExpression(node.argument, sourceCode, depth + 1)
        }

        // New Boolean(true)
        case 'NewExpression': {
            return node.callee.type === 'Identifier' && node.callee.name === 'Boolean'
        }

        // Boolean('true')
        case 'CallExpression': {
            const { callee } = node

            if (isFunctionCallThatReturnsBoolean(node)) {
                return true
            }

            if (callee.type === 'Identifier') {
                const scope = sourceCode.getScope(node.callee)

                const variable = scope.variables.find(variable => variable.name === callee.name)

                if (!variable) {
                    return false
                }

                // Determine whether the currently called function returns a Boolean type.
                return variable.defs.some(definition => {
                    if (definition.type === 'Variable') {
                        return (
                            ['FunctionExpression', 'ArrowFunctionExpression'].includes(definition.node.init?.type) &&
                            isFunctionReturnBoolean(definition.node.init, sourceCode)
                        )
                    }

                    if (definition.type === 'FunctionName') {
                        return isFunctionReturnBoolean(definition.node, sourceCode)
                    }

                    if (definition.type === 'Parameter') {
                        return isFunctionReturnBoolean(definition.node, sourceCode)
                    }

                    return false
                })
            }

            return false
        }

        // (0, true)
        case 'SequenceExpression': {
            return isBooleanExpression(node.expressions.at(-1), sourceCode, depth + 1)
        }

        // (foo = true)
        case 'AssignmentExpression': {
            return isBooleanExpression(node.right, sourceCode, depth + 1)
        }

        // @typescript-eslint/parser
        // var isAdult = getIsAdult() as boolean
        case 'TSAsExpression': {
            return isBooleanTypeAnnotation(node.typeAnnotation)
        }

        default: {
            return false
        }
    }
}

/**
 * Determine whether it is a Boolean Type Annotation
 *
 * @param {any} annotation
 * @returns
 */
function isBooleanTypeAnnotation(annotation) {
    if (!annotation) return false

    const typeAnnotation = annotation.typeAnnotation ?? annotation

    // @typescript-eslint/-parser
    if (typeAnnotation.type === 'TSBooleanKeyword') {
        return true
    }

    // @babel/parser
    if (typeAnnotation.type === 'BooleanTypeAnnotation') {
        return true
    }

    return false
}

/**
 * Determine whether it is a Boolean return
 *
 * @param {import('estree').Function} node
 * @param {import('eslint').SourceCode} sourceCode
 * @returns
 */
function isFunctionReturnBoolean(node, sourceCode) {
    return isBooleanTypeAnnotation(node.returnType) || isBooleanExpression(node.body, sourceCode)
}

module.exports = {
    isBooleanExpression,
    isBooleanTypeAnnotation,
    isFunctionReturnBoolean
}
