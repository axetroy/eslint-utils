import { SourceCode, Rule, Scope } from 'eslint'
import { Identifier } from 'estree'

/**
 * Replace the variable name of the given identifier with the given variable name.
 * @param fixer
 * @param sourceCode
 * @param scope
 * @param identifier
 * @param variableName
 */
export declare function replaceVariableName(
    fixer: Rule.Fix,
    sourceCode: SourceCode,
    scope: Scope.Scope,
    identifier: Identifier,
    variableName: string
): Generator<void>
