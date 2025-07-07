// In-memory points storage system for CLA Designs Discord Bot
// Note: This uses memory storage as per blueprint guidelines

// In-memory storage for user points and history
const userPoints = new Map();
const pointsHistory = new Map();

/**
 * Add points to a user
 * @param {string} userId - Discord user ID
 * @param {number} amount - Points to add (can be negative to remove)
 * @param {string} reason - Reason for adding points
 * @param {string} moderatorId - ID of moderator adding points
 * @returns {number} New total points for user
 */
function addPoints(userId, amount, reason = 'No reason provided', moderatorId = 'System') {
    const currentPoints = userPoints.get(userId) || 0;
    const newTotal = Math.max(0, currentPoints + amount);
    
    userPoints.set(userId, newTotal);
    
    // Add to history
    if (!pointsHistory.has(userId)) {
        pointsHistory.set(userId, []);
    }
    
    const historyEntry = {
        timestamp: new Date().toISOString(),
        amount: amount,
        reason: reason,
        moderatorId: moderatorId,
        oldTotal: currentPoints,
        newTotal: newTotal
    };
    
    pointsHistory.get(userId).push(historyEntry);
    
    console.log(`📝 Points updated: User ${userId} ${amount > 0 ? '+' : ''}${amount} points (${currentPoints} → ${newTotal}) - ${reason}`);
    
    return newTotal;
}

/**
 * Get current points for a user
 * @param {string} userId - Discord user ID
 * @returns {number} Current points
 */
function getPoints(userId) {
    return userPoints.get(userId) || 0;
}

/**
 * Get points history for a user
 * @param {string} userId - Discord user ID
 * @returns {Array} Array of history entries
 */
function getPointsHistory(userId) {
    return pointsHistory.get(userId) || [];
}

/**
 * Reset points for a user
 * @param {string} userId - Discord user ID
 * @param {string} moderatorId - ID of moderator resetting points
 * @returns {boolean} Success status
 */
function resetPoints(userId, moderatorId = 'System') {
    const currentPoints = userPoints.get(userId) || 0;
    
    if (currentPoints === 0) {
        return false; // No points to reset
    }
    
    userPoints.set(userId, 0);
    
    // Add to history
    if (!pointsHistory.has(userId)) {
        pointsHistory.set(userId, []);
    }
    
    const historyEntry = {
        timestamp: new Date().toISOString(),
        amount: -currentPoints,
        reason: 'Points reset by moderator',
        moderatorId: moderatorId,
        oldTotal: currentPoints,
        newTotal: 0
    };
    
    pointsHistory.get(userId).push(historyEntry);
    
    console.log(`🔄 Points reset: User ${userId} (${currentPoints} → 0) by ${moderatorId}`);
    
    return true;
}

/**
 * Get all users with points (for admin overview)
 * @returns {Array} Array of user objects with points
 */
function getAllUsersWithPoints() {
    const users = [];
    
    for (const [userId, points] of userPoints.entries()) {
        if (points > 0) {
            users.push({
                userId: userId,
                points: points,
                lastUpdated: getPointsHistory(userId).slice(-1)[0]?.timestamp || 'Unknown'
            });
        }
    }
    
    return users.sort((a, b) => b.points - a.points); // Sort by points descending
}

/**
 * Get users at risk of ban (12+ points)
 * @returns {Array} Array of at-risk users
 */
function getAtRiskUsers() {
    const atRiskUsers = [];
    
    for (const [userId, points] of userPoints.entries()) {
        if (points >= 12) {
            atRiskUsers.push({
                userId: userId,
                points: points,
                riskLevel: points >= 16 ? 'CRITICAL' : points >= 14 ? 'HIGH' : 'MEDIUM'
            });
        }
    }
    
    return atRiskUsers.sort((a, b) => b.points - a.points);
}

/**
 * Get statistics about the points system
 * @returns {Object} Statistics object
 */
function getPointsStats() {
    const totalUsers = userPoints.size;
    const usersWithPoints = Array.from(userPoints.values()).filter(points => points > 0).length;
    const totalPoints = Array.from(userPoints.values()).reduce((sum, points) => sum + points, 0);
    const averagePoints = usersWithPoints > 0 ? (totalPoints / usersWithPoints).toFixed(2) : 0;
    const maxPoints = Math.max(0, ...Array.from(userPoints.values()));
    const atRiskCount = getAtRiskUsers().length;
    
    return {
        totalUsers,
        usersWithPoints,
        totalPoints,
        averagePoints,
        maxPoints,
        atRiskCount
    };
}

/**
 * Cleanup old history entries (optional, for memory management)
 * @param {number} daysToKeep - Days of history to keep
 */
function cleanupHistory(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let cleanedEntries = 0;
    
    for (const [userId, history] of pointsHistory.entries()) {
        const filteredHistory = history.filter(entry => 
            new Date(entry.timestamp) > cutoffDate
        );
        
        if (filteredHistory.length !== history.length) {
            pointsHistory.set(userId, filteredHistory);
            cleanedEntries += history.length - filteredHistory.length;
        }
    }
    
    console.log(`🧹 Cleaned up ${cleanedEntries} old history entries`);
    return cleanedEntries;
}

module.exports = {
    addPoints,
    getPoints,
    getPointsHistory,
    resetPoints,
    getAllUsersWithPoints,
    getAtRiskUsers,
    getPointsStats,
    cleanupHistory
};
