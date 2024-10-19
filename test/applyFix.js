/**
 *
 * @param {string} code
 * @param {import('eslint').Rule.Fix} fix
 */
function applyFix(code, fix) {
    return replaceStringWithSlice(code, fix.range[0], fix.range[1], fix.text)
}

/**
 *
 * @param {string} str
 * @param {number} start
 * @param {number} end
 * @param {string} replacement
 * @returns {string}
 */
function replaceStringWithSlice(str, start, end, replacement) {
    return str.slice(0, start) + replacement + str.slice(end)
}

module.exports = applyFix
