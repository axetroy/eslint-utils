/**
 * Determines whether a node is a Boolean Expression.
 *
 * @typedef {'string' | 'boolean' | 'number' | 'regex' | 'null' | 'undefined' | 'function' | 'symbol' | 'bigint' | 'unknown'} NodeType
 * @param {import('estree').Expression} node
 * @param {import('eslint').SourceCode} sourceCode
 * @param {number} [depth]
 * @returns {NodeType}
 */
function getExpressionType(node, sourceCode, depth = 0) {
    if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        return 'function'
    }

    if (node.type === 'SequenceExpression') {
        return getExpressionType(node.expressions.at(-1), sourceCode, depth + 1)
    }

    if (node.type === 'AssignmentExpression') {
        return getExpressionType(node.right, sourceCode, depth + 1)
    }

    if (node.type === 'Literal') {
        if (node.bigint) return 'bigint'

        if (node.regex) return 'regex'

        if (node.value === null) return 'null'

        if (node.value === undefined) return 'undefined'

        if (typeof node.value === 'string') {
            return 'string'
        }

        if (typeof node.value === 'number') {
            return 'number'
        }

        if (typeof node.value === 'boolean') {
            return 'boolean'
        }
    }

    if (node.type === 'BinaryExpression') {
        if (['==', '!=', '===', '!==', '<', '<=', '>', '>=', 'instanceof'].includes(node.operator)) {
            return 'boolean'
        }

        if (['<<', '>>', '>>>', '&', '|', '^', , '*', '/', '%'].includes(node.operator)) {
            return 'number'
        }

        if (node.operator === '+') {
            // If either side is a string, the result is a string
            if (getExpressionType(node.left) === 'string' || getExpressionType(node.right) === 'string') {
                return 'string'
            }

            // If both sides are numbers, the result is a number
            if (getExpressionType(node.left) === 'number' && getExpressionType(node.right) === 'number') {
                return 'number'
            }
        }

        if (node.operator === '-') {
            // If both sides are numbers, the result is a number
            if (getExpressionType(node.left) === 'number' && getExpressionType(node.right) === 'number') {
                return 'number'
            }
        }
    }

    if (node.type === 'UnaryExpression') {
        if (node.operator === '!' || node.operator === 'delete') {
            return 'boolean'
        }

        if (node.operator === '+' || node.operator === '-' || node.operator === '~') {
            return 'number'
        }

        if (node.operator === 'typeof') {
            return 'string'
        }

        if (node.operator === 'void') {
            return 'undefined'
        }
    }

    if (node.type === 'ConditionalExpression') {
        const left = getExpressionType(node.consequent, sourceCode, depth + 1)
        const right = getExpressionType(node.alternate, sourceCode, depth + 1)

        if (left === right) {
            return left
        }
    }

    if (node.type === 'AwaitExpression' || node.type === 'YieldExpression') {
        return getExpressionType(node.argument, sourceCode, depth + 1)
    }

    if (node.type === 'NewExpression') {
        if (node.callee.type === 'Identifier' && node.callee.name === 'String') {
            return 'string'
        }

        if (node.callee.type === 'Identifier' && node.callee.name === 'Boolean') {
            return 'boolean'
        }

        if (node.callee.type === 'Identifier' && node.callee.name === 'Number') {
            return 'number'
        }

        if (node.callee.type === 'Identifier' && node.callee.name === 'RegExp') {
            return 'regex'
        }
    }

    if (node.type === 'LogicalExpression') {
        const left = getExpressionType(node.left, sourceCode, depth + 1)
        const right = getExpressionType(node.right, sourceCode, depth + 1)

        if (node.operator === '&&' || node.operator === '||') {
            if (left === right) {
                return left
            }
        }
    }

    if (node.type === 'CallExpression') {
        const callee = node.callee
        if (callee.type === 'Identifier') {
            if (callee.name === 'Boolean') {
                return 'boolean'
            }

            if (callee.name === 'Number') {
                return 'number'
            }

            if (callee.name === 'String') {
                return 'string'
            }

            if (callee.name === 'RegExp') {
                return 'regex'
            }

            if (callee.name === 'Array') {
                return 'array'
            }

            if (callee.name === 'Object') {
                return 'object'
            }

            if (callee.name === 'Function') {
                return 'function'
            }

            if (callee.name === 'Symbol') {
                return 'symbol'
            }

            if (callee.name === 'BigInt') {
                return 'bigint'
            }
        }
    }

    return 'unknown'
}

module.exports = {
    getExpressionType
}
