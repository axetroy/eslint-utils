const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')

const { isBooleanExpression } = require('./boolean.js')
const intoSingleLine = require('../test/intoSingleLine.js')
const { outdent } = require('outdent')

function isBooleanExpressionTest(code, selector, languageOptions = {}) {
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
                                    result = isBooleanExpression(node, context.sourceCode)
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
    ['const foo = true', 'VariableDeclarator > .init'],
    ['const foo = Boolean()', 'VariableDeclarator > .init'],
    ['const foo = new Boolean()', 'VariableDeclarator > .init'],
    ['const foo = !bar', 'VariableDeclarator > .init'],
    ['const foo = !!bar', 'VariableDeclarator > .init'],
    ['const foo = a && b', 'VariableDeclarator > .init'],
    ['const foo = (bar = true)', 'VariableDeclarator > .init'],
    ['const foo = age > 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age >= 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age == 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age === 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age < 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age <= 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age != 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age !== 18 ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age in obj ? true : false', 'VariableDeclarator > .init'],
    ['const foo = age instanceof Number ? true : false', 'VariableDeclarator > .init'],
    [
        outdent`
          async function foo () {
            const bar = await true
          }
        `,
        `VariableDeclarator[id.name='bar'] > .init`
    ],
    [
        outdent`
          function* foo () {
            const bar = yield true
          }
        `,
        `VariableDeclarator[id.name='bar'] > .init`
    ],
    // Find references to the variable
    [
        outdent`
          const foo = true

          const bar = foo
        `,
        `VariableDeclarator[id.name='bar'] > .init`
    ],
    [
        outdent`
          const foo = () => true

          const bar = foo()
        `,
        `VariableDeclarator[id.name='bar'] > .init`
    ],
    // Type Annotation
    [
        outdent`
          let foo: boolean

          const bar = foo
      `,
        `VariableDeclarator[id.name='bar'] > .init`,
        {
            parser: require('@typescript-eslint/parser')
        }
    ],
    [
        outdent`
            const bar = foo as boolean
        `,
        `VariableDeclarator[id.name='bar'] > .init`,
        {
            parser: require('@typescript-eslint/parser')
        }
    ],
    [
        outdent`
            let foo = (): boolean => {}

            const bar = foo()
        `,
        `VariableDeclarator[id.name='bar'] > .init`,
        {
            parser: require('@typescript-eslint/parser')
        }
    ],
    [
        outdent`
          function foo(arg: boolean) {
            const bar = arg
          }
        `,
        `VariableDeclarator[id.name='bar'] > .init`,
        {
            parser: require('@typescript-eslint/parser')
        }
    ]
]

for (const [index, t] of Object.entries(valid)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] isBooleanExpressionTest(${singleLineCode})`, () => {
        assert(isBooleanExpressionTest(t[0], t[1], t[2]), `Expected \`${singleLineCode}\` to be a boolean expression`)
    })
}
