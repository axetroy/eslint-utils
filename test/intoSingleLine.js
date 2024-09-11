/**
 * Make a multiline string into a single line string
 * @param {string} string
 * @returns
 */
function intoSingleLine(string) {
    return string.replace(/[\n\r]+/g, String.raw`\n`) // 将所有换行符删除
}

module.exports = intoSingleLine
