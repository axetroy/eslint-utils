/**
 *
 * @param {import('estree').Node} node
 * @returns
 */
function isBooleanAnnotation(annotation) {
    if (!annotation) return false

    const typeAnnotation = annotation.typeAnnotation ?? annotation

    // @typescript-eslint/-parser
    if (typeAnnotation.type === 'TSBooleanKeyword') {
        return true
    }

    // babel-eslint
    if (typeAnnotation.type === 'BooleanTypeAnnotation') {
        return true
    }

    return false
}

module.exports = { isBooleanAnnotation }
