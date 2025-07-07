# CLA Designs Discord Bot

## Overview

This is a comprehensive Discord bot built for the CLA Designs community. The bot provides rule management, point-based moderation system, and interactive features through slash commands and buttons. It's designed to help manage a design community with automated moderation and clear organizational structure.

## System Architecture

### Core Framework
- **Discord.js v14.21.0**: Primary framework for Discord API interaction
- **Node.js**: Runtime environment (requires 16.9.0+)
- **In-memory storage**: Simple data persistence for user points and history

### Architecture Pattern
- **Event-driven**: Uses Discord's gateway events for real-time interaction
- **Command-based**: Slash commands for user and admin interactions
- **Component-based**: Interactive buttons for enhanced user experience
- **Modular design**: Separate utility modules for permissions and points management

## Key Components

### 1. Main Bot (bot.js)
- Discord client initialization and event handling
- Slash command registration and processing
- Interactive button handling
- Auto-moderation logic (ban at 16 points)

### 2. Configuration System (config/rules.js)
- Static rule definitions for main server rules
- Order rules and pricing information
- Chain of command structure
- Modular rule content management

### 3. Points Management System (utils/pointsManager.js)
- In-memory storage using JavaScript Maps
- Point addition/removal with history tracking
- Automatic moderation triggers
- Activity logging and audit trail

### 4. Permission System (utils/permissions.js)
- Role-based access control
- Admin and moderator privilege checking
- Flexible role name matching
- Permission validation utilities

## Data Flow

### Point Management Flow
1. Admin/moderator issues point command
2. Permission validation occurs
3. Points are added/removed from memory storage
4. History entry is created with timestamp and reason
5. Auto-moderation check triggers if points >= 16
6. User receives automatic ban if threshold exceeded

### Rule Display Flow
1. User executes `/rules` command
2. Bot generates formatted embed with main rules
3. Interactive buttons are attached for additional functionality
4. Button interactions provide ephemeral responses with specific content

### Command Processing Flow
1. Discord receives slash command
2. Bot validates user permissions
3. Command logic executes with appropriate responses
4. Results are logged and stored in memory

## External Dependencies

### Required Permissions
- **Ban Members**: For automatic moderation at 16 points
- **Send Messages**: For command responses and notifications
- **Use Slash Commands**: For command registration and handling
- **Embed Links**: For formatted rule displays

### Discord API Integration
- Gateway intents for guilds, messages, and members
- Slash command registration with Discord
- Interactive components (buttons) handling
- Permission-based command access

## Deployment Strategy

### Environment Setup
- Node.js 16.9.0+ installation required
- Discord bot token configuration needed
- Server permissions must be granted before deployment

### Storage Considerations
- Currently uses in-memory storage (data lost on restart)
- Ready for database integration (Postgres recommended for persistence)
- Point history and user data stored temporarily

### Scalability Notes
- Single-server deployment model
- Memory usage grows with user activity
- Database migration path available for production use

## Changelog

```
Changelog:
- June 29, 2025. Initial setup with rules display and point system
- June 29, 2025. Added comprehensive ordering system with thread creation
- June 29, 2025. Converted update rules from button to slash command
- June 29, 2025. Updated rules content with exact user specifications
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```