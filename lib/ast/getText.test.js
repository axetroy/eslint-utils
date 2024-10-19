const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { getText } = require('./getText.js')
const intoSingleLine = require('../../test/intoSingleLine.js')

function getTextTest(code, selector) {
    const linter = new Linter({ configType: 'flat' })

    let result = ''

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
                                    result = getText(context.sourceCode, node)
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
    ['var foo = true', 'VariableDeclarator > .init', 'true'],
    ['var foo = (1, true)', 'VariableDeclarator > .init', '(1, true)'],
    ['var foo = (/** comment before */ 1, true /** comment after */)', 'VariableDeclarator > .init', '(/** comment before */ 1, true /** comment after */)'],
]

for (const [index, t] of Object.entries(testCases)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] getText(${singleLineCode})`, () => {
        const result = getTextTest(t[0], t[1])
        assert.equal(result, t[2], `Expected \`${singleLineCode}\` but got \`${result}\``)
    })
}
