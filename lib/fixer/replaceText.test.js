const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')
const outdent = require('outdent')

const { replaceText } = require('./replaceText.js')
const intoSingleLine = require('../../test/intoSingleLine.js')
const applyFix = require('../../test/applyFix.js')

function replaceTextTest(code, selector, text) {
    const linter = new Linter({ configType: 'flat' })

    /** @type {import('eslint').ESLint.Plugin} */
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
                                message: 'replace text',
                                fix: function* (fixer) {
                                    yield* replaceText(fixer, context.sourceCode, node, text)
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
    ['const foo = true', 'VariableDeclarator > .init', 'false', 'const foo = false'],
    [
        outdent`
            async function foo () {
                await bar
            }
        `,
        'AwaitExpression > .argument',
        'bar1',
        outdent`
            async function foo () {
                await bar1
            }
        `
    ],
    [
        outdent`
            function* foo () {
                yield bar
            }
        `,
        'YieldExpression > .argument',
        'baz',
        outdent`
            function* foo () {
                yield baz
            }
        `
    ],
    [
        outdent`
            function* foo () {
                yield +bar
            }
        `,
        'YieldExpression > .argument',
        'baz',
        outdent`
            function* foo () {
                yield baz
            }
        `
    ],
    [
        outdent`
            async function foo () {
                await +bar
            }
        `,
        'AwaitExpression > .argument',
        'baz',
        outdent`
            async function foo () {
                await baz
            }
        `
    ],
    // edge case
    [
        outdent`
            function* foo () {
                yield+bar
            }
        `,
        'YieldExpression > .argument',
        'baz',
        outdent`
            function* foo () {
                yield baz
            }
        `
    ],
    [
        outdent`
            async function foo () {
                await+bar
            }
        `,
        'AwaitExpression > .argument',
        'baz',
        outdent`
            async function foo () {
                await baz
            }
        `
    ]
]

for (const [index, t] of Object.entries(testCases)) {
    test(`[${Number(index) + 1}] replaceTextTest(${intoSingleLine(t[0])})`, () => {
        const result = replaceTextTest(t[0], t[1], t[2])
        assert.equal(result, t[3], `Expect \`${intoSingleLine(t[3])}\`, but got \`${intoSingleLine(result)}\``)
    })
}
