/**
 *
 * @param {import('estree').Node} node
 * @returns
 */
function isBooleanAnnotation(annotation) {
    if (!annotation) return false

    const typeAnnotation = annotation.typeAnnotation ?? annotation

    // @typescript-eslint/-parser
    if (typeAnnotation.type === 'TSBooleanKeyword' || (typeAnnotation.type === 'TSTypeReference' && typeAnnotation.typeName?.name === 'Boolean')) {
        return true
    }

    // babel-eslint9
    if (typeAnnotation.type === 'BooleanTypeAnnotation' || (typeAnnotation.type === 'GenericTypeAnnotation' && typeAnnotation.id?.name === 'Boolean')) {
        return true
    }

    return false
}

module.exports = { isBooleanAnnotation }
