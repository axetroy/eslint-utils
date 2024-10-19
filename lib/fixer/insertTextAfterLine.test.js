const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')
const outdent = require('outdent')

const { insertTextAfterLine } = require('./insertTextAfterLine.js')
const intoSingleLine = require('../../test/intoSingleLine.js')
const applyFix = require('../../test/applyFix.js')

function insertTextAfterLineTest(code, selector, { text }) {
    const linter = new Linter({ configType: 'flat' })

    const plugin = {
        rules: {
            test: {
                meta: {
                    fixable: 'code'
                },
                create(context) {
                    return {
                        [selector](node) {
                            context.report({
                                node,
                                message: 'insert text after line',
                                fix: function* (fixer) {
                                    yield* insertTextAfterLine(fixer, node, text)
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
        'VariableDeclaration',
        { text: '// test' },
        outdent`
            const foo = true

            // test
        `
    ],
    [
        outdent`
            function foo () {
                const foo = true
            }
        `,
        'VariableDeclaration',
        { text: '// test' },
        outdent`
            function foo () {
                const foo = true
                
                // test
            }
        `
    ]
]

for (const [index, t] of Object.entries(testCases)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] insertTextAfterLineTest(${singleLineCode})`, () => {
        const result = insertTextAfterLineTest(t[0], t[1], t[2])
        assert.equal(result, t[3], `Expect ${t[3]}, but got ${intoSingleLine(result)}`)
    })
}
