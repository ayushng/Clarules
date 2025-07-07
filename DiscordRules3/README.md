# CLA Designs Discord Bot

A comprehensive Discord bot for CLA Designs community featuring rule display, point management system, and automatic moderation capabilities.

## Features

### Core Functionality
- 📋 **Rule Display**: Interactive `/rules` command with formatted embed
- 👁️ **Point System**: Track user infractions with automatic moderation  
- 🎯 **Interactive Buttons**: View points, order rules, chain of command, and admin updates
- 🔨 **Auto-Moderation**: Automatic ban at 16 points
- ⚙️ **Admin Commands**: Point management via slash commands
- 🔒 **Permission System**: Role-based access control

### Commands

#### User Commands
- `/rules` - Display server rules with interactive buttons

#### Admin/Moderator Commands  
- `/addpoints <user> <amount> [reason]` - Add points to a user
- `/removepoints <user> <amount> [reason]` - Remove points from a user
- `/checkpoints <user>` - Check points for any user

### Interactive Buttons
- **View Points 👁️** - Check your current point total (ephemeral)
- **Order Rules 🎨** - View design pricing and ordering guidelines (ephemeral)
- **Chain of Command 🔗** - See organizational hierarchy (ephemeral)  
- **Update Rules ⚙️** - Admin functionality for rule updates (ephemeral)

## Setup Instructions

### Prerequisites
- Node.js 16.9.0 or higher
- Discord Application with Bot Token
- Server with "Ban Members" permission for auto-moderation

### Installation

1. **Clone or download the bot files**
   ```bash
   # Create project directory
   mkdir cla-designs-bot
   cd cla-designs-bot
   ```

2. **Install dependencies**
   ```bash
   npm install discord.js
   ```

3. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create new application
   - Go to "Bot" section and create bot
   - Copy bot token
   - Enable required bot permissions:
     - Send Messages
     - Use Slash Commands  
     - Embed Links
     - Ban Members
     - View Channels
     - Read Message History

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Replace `your_discord_bot_token_here` with your actual bot token
   - Optional: Add other configuration values

5. **Invite Bot to Server**
   - Use the invite link generated when bot starts
   - Or create custom invite with required permissions
   - Minimum permissions needed: `268435456` (integer value)

6. **Run the Bot**
   ```bash
   node bot.js
   ```

### Bot Permissions Required
- Send Messages
- Use Slash Commands
- Embed Links  
- Ban Members (for auto-moderation)
- View Channels
- Read Message History

## Configuration

### Role-Based Permissions

The bot recognizes these role categories:

**Admin Roles:**
- Owner, Co-Owner, Admin, Administrator
- Management, Head of Design, Community Manager
- Operations Director

**Moderator Roles:**  
- Moderator, Mod, Senior Moderator
- Lead Designer, Senior Staff, Staff
- Quality Assurance

**Staff Roles:**
- Designer, Graphic Designer
- Customer Service, Content Creator
- Bot Developer, Web Developer

**VIP Roles:**
- VIP, VIP Client, Verified Member
- Trusted, Premium, Supporter

### Point System

- **Warning Threshold**: 8+ points (Medium Risk)
- **High Risk**: 12+ points  
- **Auto-Ban**: 16+ points
- **Storage**: In-memory (resets on bot restart)
- **History**: Tracks all point changes with timestamps

### Customization

#### Modify Rules Content
Edit `config/rules.js` to update:
- Main server rules
- Order rules and pricing
- Chain of command structure

#### Permission Roles
Edit `utils/permissions.js` to customize role names and hierarchy.

#### Point Thresholds
Modify point limits in the bot code or add environment variables.

## Usage Examples

### Adding Points (Admins Only)
