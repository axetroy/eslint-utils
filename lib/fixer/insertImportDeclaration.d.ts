import { Rule, SourceCode } from 'eslint'
import { Node } from 'estree'

export interface Specifier {
    default?: string
    namespaces?: Array<string>
}

/**
 * Insert an import declaration for the given specifier.
 * @param fixer
 * @param sourceCode
 * @param specifier
 * @param source
 */
export declare function insertImportDeclaration(fixer: Rule.Fix, sourceCode: SourceCode, specifier: Specifier, source: string): void
