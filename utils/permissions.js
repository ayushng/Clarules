// Permission checking utilities for CLA Designs Discord Bot

/**
 * Check if a member has admin permissions
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member is admin
 */
function isAdmin(member) {
    if (!member || !member.permissions) {
        return false;
    }

    // Check for Administrator permission
    if (member.permissions.has('Administrator')) {
        return true;
    }

    // Check for specific admin roles (customize these role names as needed)
    const adminRoles = [
        'Owner',
        'Co-Owner', 
        'Admin',
        'Administrator',
        'Management',
        'Head of Design',
        'Community Manager',
        'Operations Director'
    ];

    return member.roles.cache.some(role => 
        adminRoles.some(adminRole => 
            role.name.toLowerCase().includes(adminRole.toLowerCase())
        )
    );
}

/**
 * Check if a member has moderator permissions
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member is moderator or higher
 */
function isModerator(member) {
    if (!member || !member.permissions) {
        return false;
    }

    // Admin users are also moderators
    if (isAdmin(member)) {
        return true;
    }

    // Check for moderator-specific permissions
    const modPermissions = [
        'ManageMessages',
        'KickMembers',
        'BanMembers',
        'ModerateMembers'
    ];

    if (modPermissions.some(perm => member.permissions.has(perm))) {
        return true;
    }

    // Check for specific moderator roles
    const moderatorRoles = [
        'Moderator',
        'Mod',
        'Senior Moderator',
        'Lead Designer',
        'Senior Staff',
        'Staff',
        'Quality Assurance'
    ];

    return member.roles.cache.some(role => 
        moderatorRoles.some(modRole => 
            role.name.toLowerCase().includes(modRole.toLowerCase())
        )
    );
}

/**
 * Check if a member has staff permissions (includes mods and admins)
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member is staff or higher
 */
function isStaff(member) {
    if (!member || !member.permissions) {
        return false;
    }

    // Mods and admins are staff
    if (isModerator(member) || isAdmin(member)) {
        return true;
    }

    // Check for staff roles
    const staffRoles = [
        'Staff',
        'Designer',
        'Graphic Designer',
        'Customer Service',
        'Content Creator',
        'Bot Developer',
        'Web Developer',
        'Specialist'
    ];

    return member.roles.cache.some(role => 
        staffRoles.some(staffRole => 
            role.name.toLowerCase().includes(staffRole.toLowerCase())
        )
    );
}

/**
 * Check if a member is VIP or trusted
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member is VIP/trusted
 */
function isVIP(member) {
    if (!member) {
        return false;
    }

    // Staff members are automatically VIP
    if (isStaff(member)) {
        return true;
    }

    const vipRoles = [
        'VIP',
        'VIP Client',
        'Verified Member',
        'Trusted',
        'Premium',
        'Supporter'
    ];

    return member.roles.cache.some(role => 
        vipRoles.some(vipRole => 
            role.name.toLowerCase().includes(vipRole.toLowerCase())
        )
    );
}

/**
 * Get the highest permission level for a member
 * @param {GuildMember} member - Discord guild member
 * @returns {string} Permission level name
 */
function getPermissionLevel(member) {
    if (isAdmin(member)) {
        return 'Admin';
    } else if (isModerator(member)) {
        return 'Moderator';
    } else if (isStaff(member)) {
        return 'Staff';
    } else if (isVIP(member)) {
        return 'VIP';
    } else {
        return 'Member';
    }
}

/**
 * Check if a member can manage points (add/remove)
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member can manage points
 */
function canManagePoints(member) {
    return isAdmin(member) || isModerator(member);
}

/**
 * Check if a member can view other users' points
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member can view points
 */
function canViewPoints(member) {
    return canManagePoints(member) || isStaff(member);
}

/**
 * Check if a member can ban users
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} True if member can ban
 */
function canBan(member) {
    if (!member || !member.permissions) {
        return false;
    }

    return member.permissions.has('BanMembers') || isAdmin(member);
}

/**
 * Get permission summary for a member
 * @param {GuildMember} member - Discord guild member
 * @returns {Object} Permission summary object
 */
function getPermissionSummary(member) {
    return {
        level: getPermissionLevel(member),
        isAdmin: isAdmin(member),
        isModerator: isModerator(member),
        isStaff: isStaff(member),
        isVIP: isVIP(member),
        canManagePoints: canManagePoints(member),
        canViewPoints: canViewPoints(member),
        canBan: canBan(member)
    };
}

module.exports = {
    isAdmin,
    isModerator,
    isStaff,
    isVIP,
    getPermissionLevel,
    canManagePoints,
    canViewPoints,
    canBan,
    getPermissionSummary
};
