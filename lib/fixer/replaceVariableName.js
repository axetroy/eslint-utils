const { insertTextAfterLine } = require('./insertTextAfterLine')

/**
 * 递增变量名称
 * @param {string} variableName
 */
function incrementVariableName(variableName) {
    // eslint-disable-next-line sonarjs/slow-regex
    const match = variableName.match(/(\d+)$/)

    if (match) {
        const number = Number.parseInt(match[1], 10)
        // eslint-disable-next-line sonarjs/slow-regex
        return variableName.replace(/\d+$/, number + 1)
    }

    return `${variableName}1`
}

/**
 * 获取合法的变量名，请自行确保变量已经存在
 * @param {import('eslint').Scope.Scope} scope
 * @param {string} variableName
 * @param {Array<import('estree').Identifier>} ignores
 *
 */
function ensureVariableName(scope, variableName, ignores) {
    for (const variable of scope.variables) {
        // 如果变量定义在忽略的变量中，则跳过
        if (variable.defs.some(def => ignores.includes(def.node))) {
            continue
        }

        if (variable.name === variableName) {
            return ensureVariableName(scope, incrementVariableName(variableName), ignores)
        }
    }

    return variableName
}

/**
 *
 * @param {string} str
 * @param {number} start
 * @param {number} end
 * @param {string} replacement
 * @returns {string}
 */
function replaceStringWithSlice(str, start, end, replacement) {
    return str.slice(0, start) + replacement + str.slice(end)
}

/**
 *
 * @param {import('estree').Identifier} identifier
 * @returns
 */
function isExportedVariable(identifier) {
    return (
        identifier &&
        identifier.parent?.type === 'VariableDeclarator' &&
        identifier.parent.parent?.type === 'VariableDeclaration' &&
        identifier.parent.parent.parent?.type === 'ExportNamedDeclaration'
    )
}

/**
 *
 * @param {import('estree').Identifier} identifier
 * @returns
 */
function isExportedFunction(identifier) {
    return (
        identifier &&
        identifier.parent?.type === 'FunctionDeclaration' &&
        identifier.parent.id === identifier &&
        identifier.parent.parent?.type === 'ExportNamedDeclaration'
    )
}

/**
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('eslint').Scope.Scope} scope
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('estree').Identifier} identifier
 * @param {string} newVariableName
 */
function* replace(sourceCode, fixer, identifier, newVariableName) {
    /**
     * Before:
     * ```js
     * export const foo = 1
     * ```
     *
     * After:
     * ```js
     * const foo1 = 1
     *
     * export { foo as foo1 }
     * ```
     */
    if (isExportedVariable(identifier)) {
        /** @type {import('estree').VariableDeclaration} */
        const variableDeclaration = identifier.parent.parent
        /** @type { import('estree').ExportNamedDeclaration } */
        const exportNamedDeclaration = identifier.parent.parent.parent

        let newDeclaration = sourceCode.getText(variableDeclaration)

        for (const variableDeclarator of variableDeclaration.declarations) {
            if (variableDeclarator.id === identifier) {
                const base = variableDeclaration.range[0]
                // 替换 declaration 的内容
                const start = variableDeclarator.id.range[0] - base
                const end = variableDeclarator.id.range[1] - base

                newDeclaration = replaceStringWithSlice(newDeclaration, start, end, newVariableName)
            }
        }

        yield fixer.replaceText(exportNamedDeclaration, newDeclaration)

        yield* insertTextAfterLine(fixer, exportNamedDeclaration, `export { ${newVariableName} as ${identifier.name} }`)
    } else if (isExportedFunction(identifier)) {
        /**
         * Before:
         * ```js
         * export function foo () {}
         * ```
         *
         * After:
         * ```js
         * function foo1 () {}
         *
         * export { foo1 as foo }
         * ```
         */
        const functionDeclaration = identifier.parent
        const exportNamedDeclaration = identifier.parent.parent

        yield fixer.replaceText(identifier, newVariableName)

        yield* insertTextAfterLine(fixer, exportNamedDeclaration, `export { ${newVariableName} as ${identifier.name} }`)

        const removeRange = [exportNamedDeclaration.range[0], functionDeclaration.range[0]]

        yield fixer.removeRange(removeRange)
    } else {
        yield fixer.replaceText(identifier, newVariableName)

        // @typescript-eslint/parser and @babel/parser will parse type annotation as Identifier
        if (identifier.typeAnnotation) {
            const originalText = sourceCode.getText(identifier)

            const typeAnnotationText = originalText.slice(
                identifier.typeAnnotation.range[0] - identifier.range[0],
                identifier.typeAnnotation.range[1] - identifier.range[0]
            )
            yield fixer.insertTextAfter(identifier, typeAnnotationText)
        }
    }
}

/**
 *
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('eslint').Scope.Scope} scope
 * @param {import('estree').Identifier} identifier
 * @param {string} variableName
 */
function* replaceVariableName(fixer, sourceCode, scope, identifier, variableName) {
    const newVariableName = ensureVariableName(scope, variableName, [identifier])

    yield* replace(sourceCode, fixer, identifier, newVariableName)

    const variable = scope.variables.find(variable => variable.name === identifier.name)

    const references = variable?.references ?? scope.references.filter(reference => reference.identifier.name === identifier.name)

    // 查找所有引用的地方，替换成新的变量名
    for (const reference of references) {
        if (reference.identifier !== identifier) {
            /** @type {import('estree').Node}  */
            const parent = reference.identifier.parent

            if (parent && parent.type === 'Property' && parent.value === reference.identifier && parent.shorthand) {
                /**
                 * Replace shorthand property
                 *
                 * Before:
                 * ```js
                 * const foo = 1
                 *
                 * const obj = {
                 *   foo
                 * }
                 * ```
                 *
                 * After:
                 * ```js
                 * const bar = 1
                 *
                 * const obj = {
                 *   foo: bar
                 * }
                 * ```
                 */
                yield fixer.insertTextAfter(reference.identifier, `: ${newVariableName}`)
            } else if (parent && parent.type === 'ExportSpecifier' && parent.local === reference.identifier) {
                /**
                 * Replace export specifier
                 *
                 * Before:
                 * ```js
                 * const foo = 1
                 *
                 * export { foo }
                 * ```
                 *
                 * After:
                 * ```js
                 * const bar = 1
                 *
                 * export { foo as bar }
                 * ```
                 */
                yield fixer.insertTextBefore(reference.identifier, `${newVariableName} as `)
            } else {
                yield fixer.replaceText(reference.identifier, newVariableName)
            }
        }
    }
}

module.exports = { replaceVariableName }
