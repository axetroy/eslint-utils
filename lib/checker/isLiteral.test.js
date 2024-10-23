const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { isLiteral } = require('./isLiteral.js')
const intoSingleLine = require('../../test/intoSingleLine.js')

function isLiteralTest(code, selector, languageOptions = {}) {
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
                                    result = isLiteral(node)
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
    ['var foo = 123', 'VariableDeclarator >.init'],
    ['var foo = "123"', 'VariableDeclarator >.init'],
    ['var foo = true', 'VariableDeclarator >.init'],
    ['var foo = false', 'VariableDeclarator >.init'],
    ['var foo = /regexp/', 'VariableDeclarator >.init'],
    ['var foo = 10n', 'VariableDeclarator >.init'],
    // constructor calls
    ['var foo = new Boolean(true)', 'VariableDeclarator >.init'],
    ['var foo = new String("123")', 'VariableDeclarator >.init'],
    ['var foo = new Number(123)', 'VariableDeclarator >.init'],
    ['var foo = new RegExp("regexp")', 'VariableDeclarator >.init'],
    ['var foo = new BigInt(10n)', 'VariableDeclarator >.init'],
    // function calls
    ['var foo = Boolean(true)', 'VariableDeclarator >.init'],
    ['var foo = String("123")', 'VariableDeclarator >.init'],
    ['var foo = Number(123)', 'VariableDeclarator >.init'],
    ['var foo = RegExp("regexp")', 'VariableDeclarator >.init'],
    ['var foo = BigInt(10n)', 'VariableDeclarator >.init'],
    ['var foo = Symbol("[[Foo]]")', 'VariableDeclarator >.init']
]

for (const [index, t] of Object.entries(valid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isLiteralTest(${singleLineCode})`, () => {
        assert(isLiteralTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` to be a literal`)
    })
}

const invalid = [
    ['var foo = []', 'VariableDeclarator >.init'],
    ['var foo = function () {}', 'VariableDeclarator >.init'],
    ['var foo = {}', 'VariableDeclarator >.init']
]

for (const [index, t] of Object.entries(invalid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isLiteralTest(${singleLineCode})`, () => {
        assert(!isLiteralTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` bot to be a literal`)
    })
}
