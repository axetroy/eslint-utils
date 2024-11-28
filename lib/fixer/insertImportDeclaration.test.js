const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')
const outdent = require('outdent')

const { insertImportDeclaration } = require('./insertImportDeclaration.js')
const intoSingleLine = require('../../test/intoSingleLine.js')
const applyFix = require('../../test/applyFix.js')

function insertImportDeclarationTest(code, { specifier, source }) {
    const linter = new Linter({ configType: 'flat' })

    /**
     * @type {import('eslint').ESLint.Plugin}
     */
    const plugin = {
        rules: {
            test: {
                meta: {
                    fixable: 'code'
                },
                create(context) {
                    return {
                        'Program:exit'(node) {
                            context.report({
                                node,
                                message: 'insert import declaration',
                                fix: function* (fixer) {
                                    yield* insertImportDeclaration(fixer, context.sourceCode, specifier, source)
                                }
                            })
                        }
                    }
                }
            }
        }
    }

    const messages = linter.verify(code, {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        rules: {
            'test/test': 'error'
        },
        plugins: {
            test: plugin
        }
    })

    let output = code

    for (const message of messages) {
        if (message.fatal) {
            throw new Error(`Fatal error: ${message.message}`)
        }

        if (message.fix) {
            output = applyFix(output, message.fix)
        }
    }

    return output
}

/**
 * @type {Array<Array<string, string, any>>}
 */
const testCases = [
    [
        'const foo = true',
        { specifier: { namespaces: ['join'] }, source: 'node:path' },
        outdent`
            import { join } from 'node:path';
            const foo = true
        `
    ],
    [
        'const foo = true',
        { specifier: { default: 'path' }, source: 'node:path' },
        outdent`
            import path from 'node:path';
            const foo = true
        `
    ],
    [
        'import fs from "node:fs";',
        { specifier: { default: 'path' }, source: 'node:path' },
        outdent`
            import fs from "node:fs";
            import path from 'node:path';

        `
    ],
    [
        'import path from "node:path";',
        { specifier: { default: 'path' }, source: 'node:path' },
        outdent`
            import path from "node:path";
        `
    ],
    [
        'import { join } from "node:path";',
        { specifier: { namespaces: ['join'] }, source: 'node:path' },
        outdent`
            import { join } from "node:path";
        `
    ],
    [
        'import { join } from "node:path";',
        { specifier: { namespaces: ['resolve'] }, source: 'node:path' },
        outdent`
            import { join, resolve } from "node:path";
        `
    ],
    [
        'import { join } from "node:path";',
        { specifier: { default: 'path' }, source: 'node:path' },
        outdent`
            import path, { join } from "node:path";
        `
    ]
]

for (const [index, t] of Object.entries(testCases)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] insertImportDeclarationTest(${singleLineCode})`, () => {
        const result = insertImportDeclarationTest(t[0], t[1])
        assert.equal(result, t[2])
    })
}
