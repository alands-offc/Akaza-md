const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

/**
 * Get XP range at specified level
 * @param {number} level
 * @param {number} multiplier
 * @returns {{min: number, max: number, xp: number}}
 */
function xpRange(level, multiplier = global.multiplier || 1) {
    if (level < 0) throw new TypeError('level cannot be negative value');
    level = Math.floor(level);
    const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
    const max = Math.round(Math.pow(++level, growth) * multiplier);
    return {
        min,
        max,
        xp: max - min
    };
}

/**
 * Get level by XP
 * @param {number} xp
 * @param {number} multiplier
 * @returns {number}
 */
function findLevel(xp, multiplier = global.multiplier || 1) {
    if (xp === Infinity) return Infinity;
    if (isNaN(xp)) return NaN;
    if (xp <= 0) return -1;
    let level = 0;
    do level++;
    while (xpRange(level, multiplier).min <= xp);
    return --level;
}

/**
 * Check if able to level up
 * @param {number} level
 * @param {number} xp
 * @param {number} multiplier
 * @returns {boolean}
 */
function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
    if (level < 0) return false;
    if (xp === Infinity) return true;
    if (isNaN(xp)) return false;
    if (xp <= 0) return false;
    return level < findLevel(xp, multiplier);
}

export {
    growth,
    xpRange,
    findLevel,
    canLevelUp
};
