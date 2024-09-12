const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { isInControlFlow } = require('./isInControlFlow.js')
const intoSingleLine = require('../test/intoSingleLine.js')

function isInControlFlowTest(code, selector, languageOptions = {}) {
    const linter = new Linter({ configType: 'flat' })

    let result = false

    const messages = linter.verify(code, {
        languageOptions: {
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
                                    result = isInControlFlow(node)
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
    ['if (bar) {}', 'Identifier[name="bar"]'],
    ['while(bar) {}', 'Identifier[name="bar"]'],
    ['for(;bar;) {}', 'Identifier[name="bar"]'],
    ['do {} while (bar) {}', 'Identifier[name="bar"]'],
    ['switch(bar) {}', 'Identifier[name="bar"]'],
    ['if (foo || bar) {}', 'Identifier[name="bar"]'],
    ['if (foo && bar) {}', 'Identifier[name="bar"]']
]

for (const [index, t] of Object.entries(valid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isInControlFlowTest(${singleLineCode})`, () => {
        assert(isInControlFlowTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` to be detected as in control flow`)
    })
}
