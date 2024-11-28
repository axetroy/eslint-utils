/**
 * 插入 import 语句
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('eslint').SourceCode} sourceCode
 * @param {{ default?: string, namespaces?: Array<string> }} specifier
 * @param {source} source
 */
function* insertImportDeclaration(fixer, sourceCode, specifier, source) {
    // 获取所有节点并过滤出 ImportDeclaration 类型
    const importDeclarations = sourceCode.ast.body.filter(node => node.type === 'ImportDeclaration')

    const target = [specifier.default ? specifier.default : '', specifier.namespaces?.length > 0 ? `{ ${specifier.namespaces.join(', ')} }` : '']
        .filter(v => v)
        .join(', ')

    const statement = `import ${target} from '${source}';\n`

    if (importDeclarations.length > 0) {
        const sameSourceDeclaration = importDeclarations.find(v => v.source.value === source)

        if (sameSourceDeclaration) {
            const importSpecifiers = sameSourceDeclaration.specifiers.filter(v => v.type === 'ImportSpecifier')
            const importDefaultSpecifier = sameSourceDeclaration.specifiers.filter(v => v.type === 'ImportDefaultSpecifier')

            // handle specifier
            if (specifier.namespaces) {
                for (const target of specifier.namespaces) {
                    const isExistSameSpecifier = importSpecifiers.find(v => v.imported.name === target)

                    if (isExistSameSpecifier) {
                        continue
                    } else if (importSpecifiers.length !== 0) {
                        // 在最后一个 specifier 后插入
                        const lastSpecifier = sameSourceDeclaration.specifiers.at(-1)

                        yield fixer.insertTextAfter(lastSpecifier, `, ${target}`)
                    } else {
                        // 在 from 之前插入
                        const fromToken = sourceCode.getTokenBefore(sameSourceDeclaration.source)

                        yield fixer.insertTextAfter(fromToken, `, { ${target} }`)
                    }
                }
            }

            // handle default
            if (specifier.default) {
                const isExistSameDefaultSpecifier = importDefaultSpecifier.find(v => v.local.name === specifier.default)

                if (isExistSameDefaultSpecifier) {
                    return
                }

                // 在 { 之前插入
                const bracesStart = sourceCode.getTokenBefore(importSpecifiers.at(0))

                yield fixer.insertTextBefore(bracesStart, specifier.default)
                yield fixer.insertTextBefore(bracesStart, ', ')
            }
        } else {
            const lastImportDeclaration = importDeclarations.at(-1)

            // 检查是否已经有这个 import 了
            yield fixer.insertTextAfter(lastImportDeclaration, '\n')
            yield fixer.insertTextAfter(lastImportDeclaration, statement)
        }
    } else {
        yield fixer.insertTextBefore(sourceCode.ast, statement)
    }
}

module.exports = { insertImportDeclaration }
