const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { isFunctionCall } = require('./isFunctionCall.js')
const intoSingleLine = require('../../test/intoSingleLine.js')

function isFunctionCallTest(code, selector, { target, argCount, minArgCount, maxArgCount }) {
    const linter = new Linter({ configType: 'flat' })

    let result = false

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
            test: {
                rules: {
                    test: {
                        create(context) {
                            return {
                                [selector](node) {
                                    result = isFunctionCall(node, target, { argCount, minArgCount, maxArgCount })
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
    ['foo()', 'CallExpression', { target: 'foo' }],
    ['foo.bar()', 'CallExpression', { target: 'foo.bar' }],
    ['Object.hasOwn()', 'CallExpression', { target: 'Object.hasOwn' }],
    // validate the argument count
    ['Array.isArray(bar)', 'CallExpression', { target: 'Array.isArray', argCount: 1 }],
    ['Object.hasOwn(obj, key)', 'CallExpression', { target: 'Object.hasOwn', argCount: 2 }],
    // validate the * wildcard
    ['foo.bar()', 'CallExpression', { target: '*.bar' }],
    ['foo.baz.bar()', 'CallExpression', { target: '*.bar' }]
]

for (const [index, t] of Object.entries(valid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isFunctionCall(${singleLineCode})`, () => {
        assert(isFunctionCallTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` should be a expected function call`)
    })
}

const invalid = [
    ['bar.foo()', 'CallExpression', { target: 'foo' }],
    ['Object.hasOwn(obj, key)', 'CallExpression', { target: 'Object.unknown', argCount: 2 }],
    ['Object.hasOwn(obj, key)', 'CallExpression', { target: 'Object.hasOwn', argCount: 1 }]
]

for (const [index, t] of Object.entries(invalid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isFunctionCall(${singleLineCode})`, () => {
        assert(!isFunctionCallTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` should not be a expected function call`)
    })
}
