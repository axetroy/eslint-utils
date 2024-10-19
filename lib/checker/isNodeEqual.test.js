const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')
const outdent = require('outdent')

const { isNodeEqual } = require('./isNodeEqual.js')
const intoSingleLine = require('../../test/intoSingleLine.js')

function isNodeEqualTest(code, selector1, selector2) {
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
                            let one
                            let two

                            return {
                                [selector1](node) {
                                    one = node
                                },
                                [selector2](node) {
                                    two = node
                                },
                                'Program:exit'() {
                                    result = isNodeEqual(one, two)
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
const testCases = [
    [
        outdent`
            var foo = true;
            var bar = true;    
        `,
        'VariableDeclarator[id="foo"] > .init',
        'VariableDeclarator[id="foo"] > .init',
        true
    ],
    [
        outdent`
            var foo = { a: 123 };
            var bar = { a: 123 };    
        `,
        'VariableDeclarator[id="foo"] > .init',
        'VariableDeclarator[id="foo"] > .init',
        true
    ],
    [
        outdent`
            var foo = [1,2,3];
            var bar = [1, 2, 3];    
        `,
        'VariableDeclarator[id="foo"] > .init',
        'VariableDeclarator[id="foo"] > .init',
        true
    ],
    [
        outdent`
            var foo = function () {};
            var bar = function () {};    
        `,
        'VariableDeclarator[id="foo"] > .init',
        'VariableDeclarator[id="foo"] > .init',
        true
    ]
]

for (const [index, t] of Object.entries(testCases)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isNodeEqualTest(${singleLineCode})`, () => {
        const result = isNodeEqualTest(t[0], t[1], t[2])
        assert.equal(result, t[3], `Expected \`${singleLineCode}\` but got \`${result}\``)
    })
}
