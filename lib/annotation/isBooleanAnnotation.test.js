const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { isBooleanAnnotation } = require('./isBooleanAnnotation.js')
const intoSingleLine = require('../../test/intoSingleLine.js')

function isBooleanAnnotationTest(code, selector, languageOptions = {}) {
    const linter = new Linter({ configType: 'flat' })

    let result = false

    const messages = linter.verify(code, {
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            ...languageOptions,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        rules: {
            'test/test': 'error'
        },
        plugins: {
            test: {
                rules: {
                    test: {
                        create(context) {
                            return {
                                [selector](node) {
                                    console.log(node)
                                    result = isBooleanAnnotation(node)
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    for (const message of messages) {
        if (message.fatal) {
            throw new Error(`Fatal error: ${message.message}`)
        }
    }

    return result
}

/**
 * @type {Array<Array<string, string, any>>}
 */
const valid = [
    ['const foo = (bar as boolean)', 'VariableDeclarator > .init > .typeAnnotation'],
    ['let foo: boolean', 'VariableDeclarator > .id > .typeAnnotation'],
    ['function foo(): boolean {}', 'FunctionDeclaration > .returnType'],

    ['const foo = (bar as Boolean)', 'VariableDeclarator > .init > .typeAnnotation'],
    ['let foo: Boolean', 'VariableDeclarator > .id > .typeAnnotation'],
    ['function foo(): Boolean {}', 'FunctionDeclaration > .returnType']
]

for (const [index, t] of Object.entries(valid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isBooleanAnnotationTest(${singleLineCode})`, () => {
        assert(isBooleanAnnotationTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` got a boolean annotation`)
    })
}
