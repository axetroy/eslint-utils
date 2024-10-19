import { Node } from 'estree'

interface isFunctionCallOptions {
    argCount?: number
    minArgCount?: number
    maxArgCount?: number
}

/**
 * Check if a node is a function call with the given target name
 * @param node
 * @param target
 * @param options
 * @example
 * ```js
 * isFunctionCall(node, 'foo', { argCount: 2 }) // true if node is `foo(1, 2)`
 * isFunctionCall(node, 'bar.foo()') // true if node is `bar.foo()`
 * isFunctionCall(node, 'foo', { minArgCount: 2 }) // true if node is `foo(1, 2, 3)`
 * isFunctionCall(node, 'foo', { maxArgCount: 2 }) // true if node is `foo(1)` or `foo(1, 2)`
 * isFunctionCall(node, '*.foo', { maxArgCount: 2 }) // true if node is `bar.foo(1, 2)` or `baz.foo(1, 2)`
 * ```
 */
export declare function isFunctionCall(node: Node, target: string, options?: isFunctionCallOptions): boolean
