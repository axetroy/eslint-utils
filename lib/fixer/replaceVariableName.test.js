const test = require('node:test')
const assert = require('node:assert')
const { Linter } = require('eslint')
const outdent = require('outdent')

const { replaceVariableName } = require('./replaceVariableName.js')
const intoSingleLine = require('../../test/intoSingleLine.js')
const applyFix = require('../../test/applyFix.js')

function replaceVariableNameTest(code, selector, { name }) {
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
                                message: 'replace variable name',
                                fix: function* (fixer) {
                                    yield* replaceVariableName(fixer, context.sourceCode, context.sourceCode.getScope(node), node, name)
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
    ['const foo = true', 'VariableDeclarator > .id', { name: 'bar' }, 'const bar = true'],
    [
        outdent`
            const foo = true
            console.log(foo)
        `,
        'VariableDeclarator > .id',
        { name: 'bar' },
        outdent`
            const bar = true
            console.log(bar)
        `
    ],
    [
        outdent`
            const foo = true
            const bar = true
            console.log(foo, bar)
        `,
        'VariableDeclarator > .id[name="foo"]',
        { name: 'bar' },
        outdent`
            const bar1 = true
            const bar = true
            console.log(bar1, bar)
        `
    ],
    [
        outdent`
            function foo () {
                const bar = true

                console.log(bar)
            }
        `,
        'VariableDeclarator > .id',
        { name: 'newBar' },
        outdent`
            function foo () {
                const newBar = true

                console.log(newBar)
            }
        `
    ],
    [
        outdent`
            const foo = true
            const obj = {
                foo
            }
        `,
        'VariableDeclarator > .id[name="foo"]',
        { name: 'bar' },
        outdent`
            const bar = true
            const obj = {
                foo: bar
            }
        `
    ],
    [
        outdent`
            const foo = true
            
            export { foo }
        `,
        'VariableDeclarator > .id[name="foo"]',
        { name: 'bar' },
        outdent`
            const bar = true
            
            export { bar as foo }
        `
    ],
    [
        outdent`
            const foo = true
            
            (foo)
        `,
        'VariableDeclarator > .id[name="foo"]',
        { name: 'bar' },
        outdent`
            const bar = true
            
            (bar)
        `
    ],
    // Replace function name
    [
        outdent`
            function foo () {
            }
        `,
        'FunctionDeclaration > .id',
        { name: 'bar' },
        outdent`
            function bar () {
            }
        `
    ],
    [
        outdent`
            export function foo (depth = 0) {
                if (depth > 10) {
                    return depth
                }

                foo(depth + 1)
            }
        `,
        'FunctionDeclaration > .id',
        { name: 'bar' },
        outdent`
            function bar (depth = 0) {
                if (depth > 10) {
                    return depth
                }

                bar(depth + 1)
            }

            export { bar as foo }
        `
    ]
]

for (const [index, t] of Object.entries(testCases)) {
    const singleLineCode = intoSingleLine(t[0])

    test(`[${Number(index) + 1}] replaceVariableNameTest(${singleLineCode})`, () => {
        const result = replaceVariableNameTest(t[0], t[1], t[2])
        assert.equal(result, t[3], `Expect ${t[3]}, but got ${intoSingleLine(result)}`)
    })
}
