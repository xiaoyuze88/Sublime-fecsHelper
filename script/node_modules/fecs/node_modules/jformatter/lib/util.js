/**
 * util
 * @author ishowshao
 */

/**
 * insert token before a token
 * @param {Object} token
 * @param {Object} insertion
 */
exports.insertBefore = function (token, insertion) {
    if (!token.prev) { // insert at first
        token.prev = insertion;
        insertion.next = token;
    } else {
        token.prev.next = insertion;
        insertion.prev = token.prev;
        insertion.next = token;
        token.prev = insertion;
    }
};

/**
 * insert token after a token
 * @param {Object} token
 * @param {Object} insertion
 */
exports.insertAfter = function (token, insertion) {
    if (!token.next) { // insert at last
        token.next = insertion;
        insertion.prev = token;
    } else {
        token.next.prev = insertion;
        insertion.next = token.next;
        insertion.prev = token;
        token.next = insertion;
    }
};

/**
 * remove token in tokens
 * @param {Object} token
 */
exports.removeToken = function (token) {
    if (token.prev && token.next) {
        token.prev.next = token.next;
        token.next.prev = token.prev;
    } else if (token.prev) {
        token.prev.next = undefined;
    } else if (token.next) {
        token.next.prev = undefined;
    }
};

/**
 * @param token
 * @returns {boolean}
 */
exports.isLineBreak = function (token) {
    return token.type === 'LineBreak';
};

/**
 * check if a token is white space
 * @param token
 * @returns {boolean}
 */
exports.isWhiteSpace = function (token) {
    return token.type === 'WhiteSpace';
};
