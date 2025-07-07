const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { mainRules, orderRules, chainOfCommand } = require('./config/rules');
const { addPoints, getPoints, resetPoints } = require('./utils/pointsManager');
const { isAdmin, isModerator, isStaff } = require('./utils/permissions');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`🔗 Invite link: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=268435456&scope=bot%20applications.commands`);
    
    // Register slash commands
    await registerCommands();
});

// Register slash commands
async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('rules')
            .setDescription('Display CLA Designs server rules with interactive options'),
        
        new SlashCommandBuilder()
            .setName('addpoints')
            .setDescription('Add points to a user (Admin only)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to add points to')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Number of points to add')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(16))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for adding points')
                    .setRequired(false)),
        
        new SlashCommandBuilder()
            .setName('removepoints')
            .setDescription('Remove points from a user (Admin only)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to remove points from')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Number of points to remove')
                    .setRequired(true)
                    .setMinValue(1))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for removing points')
                    .setRequired(false)),
        
        new SlashCommandBuilder()
            .setName('checkpoints')
            .setDescription('Check points for a user (Admin/Moderator only)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to check points for')
                    .setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('updaterules')
            .setDescription('Update server rules (Admin only)'),
        
        new SlashCommandBuilder()
            .setName('orderinfo')
            .setDescription('View available design services and pricing')
    ];

    try {
        console.log('🔄 Registering slash commands...');
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'rules':
                await handleRulesCommand(interaction);
                break;
            case 'addpoints':
                await handleAddPointsCommand(interaction);
                break;
            case 'removepoints':
                await handleRemovePointsCommand(interaction);
                break;
            case 'checkpoints':
                await handleCheckPointsCommand(interaction);
                break;
            case 'updaterules':
                await handleUpdateRulesCommand(interaction);
                break;
            case 'orderinfo':
                await handleOrderInfoCommand(interaction);
                break;
        }
    } catch (error) {
        console.error(`❌ Error handling command ${commandName}:`, error);
        const errorMessage = 'An error occurred while processing your command. Please try again later.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Handle button interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    try {
        switch (interaction.customId) {
            case 'view_points':
                await handleViewPointsButton(interaction);
                break;
            case 'order_rules':
                await handleOrderRulesButton(interaction);
                break;
            case 'place_order_basic_livery':
                await handlePlaceOrderButton(interaction, 'basic_livery');
                break;
            case 'place_order_premium_livery':
                await handlePlaceOrderButton(interaction, 'premium_livery');
                break;
            case 'place_order_basic_avatar':
                await handlePlaceOrderButton(interaction, 'basic_avatar');
                break;
            case 'place_order_premium_avatar':
                await handlePlaceOrderButton(interaction, 'premium_avatar');
                break;
            case 'place_order_standard_els':
                await handlePlaceOrderButton(interaction, 'standard_els');
                break;
            case 'claim_order':
                await handleClaimOrderButton(interaction);
                break;
            case 'end_order':
                await handleEndOrderButton(interaction);
                break;
            case 'chain_command':
                await handleChainCommandButton(interaction);
                break;

        }
    } catch (error) {
        console.error(`❌ Error handling button ${interaction.customId}:`, error);
        await interaction.reply({ 
            content: 'An error occurred while processing your request. Please try again later.', 
            ephemeral: true 
        });
    }
});

// Command handlers
async function handleRulesCommand(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📋 CLA Designs - Server Rules')
        .setDescription(mainRules)
        .setFooter({ text: 'CLA Designs | Follow the rules to maintain a positive community' })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_points')
                .setLabel('View Points')
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('order_rules')
                .setLabel('Order Rules')
                .setEmoji('🎨')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('chain_command')
                .setLabel('Chain of Command')
                .setEmoji('🔗')
                .setStyle(ButtonStyle.Secondary),

        );

    // Send as a regular bot message to the channel instead of a slash command reply
    await interaction.deferReply();
    await interaction.deleteReply();
    
    await interaction.channel.send({ embeds: [embed], components: [row] });
}

async function handleAddPointsCommand(interaction) {
    if (!isAdmin(interaction.member) && !isModerator(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to use this command. Admin or Moderator role required.', 
            ephemeral: true 
        });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const newTotal = addPoints(targetUser.id, amount, reason, interaction.user.id);
    
    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⚠️ Points Added')
        .addFields(
            { name: 'User', value: `<@${targetUser.id}>`, inline: true },
            { name: 'Points Added', value: `${amount}`, inline: true },
            { name: 'New Total', value: `${newTotal}/16`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Added by', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Check for automatic ban
    if (newTotal >= 16) {
        try {
            const guild = interaction.guild;
            const member = await guild.members.fetch(targetUser.id);
            
            if (member.bannable) {
                await member.ban({ reason: `Automatic ban: Reached ${newTotal} points` });
                
                const banEmbed = new EmbedBuilder()
                    .setColor('#8B0000')
                    .setTitle('🔨 Automatic Ban Executed')
                    .setDescription(`<@${targetUser.id}> has been automatically banned for reaching ${newTotal} points.`)
                    .addFields({ name: 'Final Reason', value: reason, inline: false })
                    .setTimestamp();

                await interaction.followUp({ embeds: [banEmbed] });
                console.log(`🔨 Auto-banned user ${targetUser.tag} (${targetUser.id}) for reaching ${newTotal} points`);
            } else {
                await interaction.followUp({ 
                    content: `⚠️ User <@${targetUser.id}> has reached ${newTotal} points but cannot be banned (insufficient permissions or higher role).`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('❌ Error executing automatic ban:', error);
            await interaction.followUp({ 
                content: `⚠️ User <@${targetUser.id}> has reached ${newTotal} points but auto-ban failed. Manual action required.`, 
                ephemeral: true 
            });
        }
    }
}

async function handleRemovePointsCommand(interaction) {
    if (!isAdmin(interaction.member) && !isModerator(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to use this command. Admin or Moderator role required.', 
            ephemeral: true 
        });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const currentPoints = getPoints(targetUser.id);
    const newTotal = Math.max(0, currentPoints - amount);
    
    addPoints(targetUser.id, -amount, `Points removed: ${reason}`, interaction.user.id);

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('✅ Points Removed')
        .addFields(
            { name: 'User', value: `<@${targetUser.id}>`, inline: true },
            { name: 'Points Removed', value: `${amount}`, inline: true },
            { name: 'New Total', value: `${newTotal}/16`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Removed by', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleCheckPointsCommand(interaction) {
    if (!isAdmin(interaction.member) && !isModerator(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to use this command. Admin or Moderator role required.', 
            ephemeral: true 
        });
    }

    const targetUser = interaction.options.getUser('user');
    const points = getPoints(targetUser.id);

    const embed = new EmbedBuilder()
        .setColor('#4A90E2')
        .setTitle('👁️ Point Check')
        .addFields(
            { name: 'User', value: `<@${targetUser.id}>`, inline: true },
            { name: 'Current Points', value: `${points}/16`, inline: true },
            { name: 'Status', value: points >= 16 ? '🔴 Ban Threshold Reached' : points >= 12 ? '🟡 High Risk' : points >= 8 ? '🟠 Medium Risk' : '🟢 Low Risk', inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Button handlers
async function handleViewPointsButton(interaction) {
    const points = getPoints(interaction.user.id);
    
    const embed = new EmbedBuilder()
        .setColor('#4A90E2')
        .setTitle('👁️ Your Current Points')
        .setDescription(`You currently have **${points}/16** points.`)
        .addFields({
            name: 'Status',
            value: points >= 16 ? '🔴 Ban Threshold Reached' : 
                   points >= 12 ? '🟡 High Risk - Be careful!' :
                   points >= 8 ? '🟠 Medium Risk - Watch your behavior' :
                   '🟢 Low Risk - Keep it up!',
            inline: false
        })
        .setFooter({ text: 'Points are given for rule violations. Automatic ban occurs at 16 points.' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleOrderRulesButton(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#FF9500')
        .setTitle('🎨 Order Rules & Pricing')
        .setDescription(orderRules)
        .setFooter({ text: 'CLA Designs | Professional design services' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleChainCommandButton(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#6A5ACD')
        .setTitle('🔗 Chain of Command')
        .setDescription(chainOfCommand)
        .setFooter({ text: 'CLA Designs | Organizational Structure' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleUpdateRulesCommand(interaction) {
    if (!isAdmin(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to update rules. Admin role required.', 
            ephemeral: true 
        });
    }

    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⚙️ Update Rules')
        .setDescription('Rules update functionality is currently under development. Please contact the bot developer for rule updates.')
        .addFields({
            name: 'Available Actions',
            value: '• Contact bot administrator\n• Request rule modifications\n• Suggest new rules',
            inline: false
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleOrderInfoCommand(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎨 CLA Designs - Order Services')
        .setDescription('Choose from our available design services below. Click a button to place your order!')
        .addFields(
            { name: '✅ Liveries', value: '• Basic Livery - 30 Robux\n• Premium Livery - 60 Robux', inline: true },
            { name: '✅ Avatars', value: '• Basic Avatar - 30 Robux\n• Premium Avatar - 60 Robux', inline: true },
            { name: '✅ ELS Systems', value: '• Standard ELS - 50 Robux', inline: true },
            { name: '📋 Important Notes', value: '• Payment required before work begins\n• No refunds once work starts\n• 3-7 day delivery time\n• Provide clear references', inline: false }
        )
        .setFooter({ text: 'Click the buttons below to place your order!' })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('place_order_basic_livery')
                .setLabel('Basic Livery - 30 Robux')
                .setEmoji('🏎️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('place_order_premium_livery')
                .setLabel('Premium Livery - 60 Robux')
                .setEmoji('🏎️')
                .setStyle(ButtonStyle.Primary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('place_order_basic_avatar')
                .setLabel('Basic Avatar - 30 Robux')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('place_order_premium_avatar')
                .setLabel('Premium Avatar - 60 Robux')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Secondary)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('place_order_standard_els')
                .setLabel('Standard ELS - 50 Robux')
                .setEmoji('🚨')
                .setStyle(ButtonStyle.Success)
        );

    // Send as a regular bot message to the channel instead of a slash command reply
    await interaction.deferReply();
    await interaction.deleteReply();
    
    await interaction.channel.send({ embeds: [embed], components: [row1, row2, row3] });
}

async function handlePlaceOrderButton(interaction, orderType) {
    const user = interaction.user;
    
    // Define order details
    const orderDetails = {
        'basic_livery': { name: 'Basic Livery', price: '30 Robux', category: 'Liveries' },
        'premium_livery': { name: 'Premium Livery', price: '60 Robux', category: 'Liveries' },
        'basic_avatar': { name: 'Basic Avatar', price: '30 Robux', category: 'Avatars' },
        'premium_avatar': { name: 'Premium Avatar', price: '60 Robux', category: 'Avatars' },
        'standard_els': { name: 'Standard ELS', price: '50 Robux', category: 'ELS' }
    };
    
    const order = orderDetails[orderType];
    
    try {
        // Create a private channel for the order
        const channelName = `order-${order.name.toLowerCase().replace(/\s+/g, '-')}-${user.username}`.toLowerCase();
        
        const guild = interaction.guild;
        
        const orderChannel = await guild.channels.create({
            name: channelName,
            type: 0, // Text channel
            parent: null, // You can set a category ID here if needed
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: ['ViewChannel'],
                },
                {
                    id: user.id, // Customer
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
                // Add permissions for designer roles
                ...guild.roles.cache
                    .filter(role => 
                        ['Designer', 'Graphic Designer', 'Lead Designer', 'Senior Designer', 
                         'Head of Design', 'Junior Designer', 'Staff', 'Admin', 'Moderator'].some(designerRole => 
                            role.name.toLowerCase().includes(designerRole.toLowerCase())
                        )
                    )
                    .map(role => ({
                        id: role.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    }))
            ],
            reason: `New design order: ${order.name} by ${user.username}`
        });
        
        // Initial order confirmation embed
        const orderEmbed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('🎨 New Design Order Created')
            .setDescription(`Order channel created successfully!`)
            .addFields(
                { name: 'Order Type', value: order.name, inline: true },
                { name: 'Price', value: order.price, inline: true },
                { name: 'Customer', value: `<@${user.id}>`, inline: true },
                { name: 'Channel', value: `<#${orderChannel.id}>`, inline: false }
            )
            .setFooter({ text: 'Please continue the order process in the channel above.' })
            .setTimestamp();

        // Send ephemeral confirmation to the user
        await interaction.reply({ 
            embeds: [orderEmbed], 
            flags: MessageFlags.Ephemeral 
        });
        
        // Send welcome message in the thread with questions
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`🎨 ${order.name} Order - ${order.price}`)
            .setDescription(`Welcome <@${user.id}>! Let's get started with your ${order.name} order.`)
            .addFields(
                { name: '📋 Order Details', value: `**Type:** ${order.name}\n**Price:** ${order.price}\n**Category:** ${order.category}`, inline: false },
                { name: '⚠️ Important Reminders', value: '• Payment is required before work begins\n• No refunds once work has started\n• Please provide clear references', inline: false }
            )
            .setTimestamp();
            
        await orderChannel.send({ embeds: [welcomeEmbed] });
        
        // Send individual question messages
        await orderChannel.send('**Question 1 of 5:** Please describe exactly what you want designed. Be as specific as possible.');
        
        await orderChannel.send('**Question 2 of 5:** Do you have any logos, images, colors, or examples you want us to use? Please share them here.');
        
        await orderChannel.send('**Question 3 of 5:** Any specific dimensions, formats, or technical requirements?');
        
        await orderChannel.send('**Question 4 of 5:** When do you need this completed? (Standard delivery is 3-7 days)');
        
        await orderChannel.send('**Question 5 of 5:** Please confirm you understand payment of **' + order.price + '** is required before work begins.');
        
        // Add claim and end buttons for designers
        const orderControlsEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🛠️ Order Controls (Designers Only)')
            .setDescription('Use the buttons below to manage this order:')
            .addFields(
                { name: 'Claim Order', value: 'Click to claim this order and assign it to yourself', inline: true },
                { name: 'End Order', value: 'Click when the order is completed and delivered', inline: true }
            );
            
        const controlsRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_order')
                    .setLabel('Claim Order')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('end_order')
                    .setLabel('End Order')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Danger)
            );
            
        await orderChannel.send({ embeds: [orderControlsEmbed], components: [controlsRow] });
        
        // Notify designers with role mentions (these role names should match your server)
        const designerRoles = [
            'Designer', 'Graphic Designer', 'Lead Designer', 'Senior Designer', 
            'Head of Design', 'Junior Designer', 'Staff'
        ];
        const availableRoles = guild.roles.cache.filter(role => 
            designerRoles.some(designerRole => 
                role.name.toLowerCase().includes(designerRole.toLowerCase())
            )
        );
        
        let roleMentions = '';
        if (availableRoles.size > 0) {
            roleMentions = availableRoles.map(role => `<@&${role.id}>`).join(' ');
        }
        
        const designerNotification = `🔔 **New Order Alert!**\n\n${roleMentions}\n\nA new **${order.name}** order has been placed by <@${user.id}>.\nPlease review the order details and questions above, then assist the customer with their request.\n\n**Order Value:** ${order.price}`;
        
        await orderChannel.send(designerNotification);
        
        // Send order log to #logs channel
        try {
            const logsChannel = guild.channels.cache.find(channel => 
                channel.name === 'logs' && channel.type === 0 // Text channel
            );
            
            if (logsChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#4ECDC4')
                    .setTitle('📝 Order Created')
                    .setDescription(`A new design order has been placed`)
                    .addFields(
                        { name: 'Order Type', value: order.name, inline: true },
                        { name: 'Price', value: order.price, inline: true },
                        { name: 'Customer', value: `<@${user.id}>`, inline: true },
                        { name: 'Channel', value: `<#${orderChannel.id}>`, inline: false },
                        { name: 'Category', value: order.category, inline: true }
                    )
                    .setFooter({ text: `Customer ID: ${user.id}` })
                    .setTimestamp();
                    
                await logsChannel.send({ embeds: [logEmbed] });
            }
        } catch (logError) {
            console.error('Error sending to logs channel:', logError);
        }
        
        console.log(`📋 New order created: ${order.name} by ${user.username} (${user.id}) in channel ${orderChannel.id}`);
        
    } catch (error) {
        console.error('❌ Error creating order channel:', error);
        await interaction.reply({ 
            content: '❌ There was an error creating your order. Please try again or contact an administrator.', 
            flags: MessageFlags.Ephemeral 
        });
    }
}

async function handleClaimOrderButton(interaction) {
    // Check if user has designer permissions
    if (!isStaff(interaction.member) && !isModerator(interaction.member) && !isAdmin(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to claim orders. Designer role required.', 
            ephemeral: true 
        });
    }
    
    const thread = interaction.channel;
    const claimer = interaction.user;
    
    // Update thread name to show who claimed it
    const currentName = thread.name;
    const newName = currentName.includes('- CLAIMED') ? 
        currentName.replace(/- CLAIMED by .+/, `- CLAIMED by ${claimer.username}`) :
        `${currentName} - CLAIMED by ${claimer.username}`;
    
    try {
        await thread.setName(newName);
        
        const claimEmbed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('✋ Order Claimed')
            .setDescription(`**Claimed by ${claimer.username}**`)
            .addFields(
                { name: 'Designer Assigned', value: `<@${claimer.id}>`, inline: true },
                { name: 'Status', value: 'In Progress', inline: true },
                { name: 'Claimed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();
            
        await interaction.reply({ embeds: [claimEmbed] });
        
        console.log(`✋ Order claimed by ${claimer.username} (${claimer.id}) in thread ${thread.id}`);
        
    } catch (error) {
        console.error('❌ Error claiming order:', error);
        await interaction.reply({ 
            content: '❌ There was an error claiming this order. Please try again.', 
            ephemeral: true 
        });
    }
}

async function handleEndOrderButton(interaction) {
    // Check if user has designer permissions
    if (!isStaff(interaction.member) && !isModerator(interaction.member) && !isAdmin(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ You do not have permission to end orders. Designer role required.', 
            flags: MessageFlags.Ephemeral 
        });
    }
    
    const orderChannel = interaction.channel;
    const ender = interaction.user;
    
    // Update channel name to show completion
    const currentName = orderChannel.name;
    const newName = currentName.includes('-completed') ? 
        currentName :
        `${currentName}-completed`;
    
    try {
        await orderChannel.setName(newName);
        
        const completionEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ Order Completed')
            .setDescription('This order has been marked as completed and delivered!')
            .addFields(
                { name: 'Completed by', value: `<@${ender.id}>`, inline: true },
                { name: 'Status', value: 'Delivered', inline: true },
                { name: 'Completed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: 'Thank You!', value: 'Thank you for choosing CLA Designs! We hope you love your new design.', inline: false }
            )
            .setFooter({ text: 'This thread will be archived automatically.' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [completionEmbed] });
        
        // Archive the thread after completion
        setTimeout(async () => {
            try {
                await thread.setArchived(true, 'Order completed and delivered');
                console.log(`📦 Thread ${thread.id} archived after order completion`);
            } catch (error) {
                console.error('❌ Error archiving thread:', error);
            }
        }, 30000); // Archive after 30 seconds
        
        console.log(`✅ Order completed by ${ender.username} (${ender.id}) in thread ${thread.id}`);
        
    } catch (error) {
        console.error('❌ Error ending order:', error);
        await interaction.reply({ 
            content: '❌ There was an error completing this order. Please try again.', 
            ephemeral: true 
        });
    }
}

// Login with bot token
const token = process.env.DISCORD_TOKEN || 'your_bot_token_here';

if (!token || token === 'your_bot_token_here') {
    console.error('❌ No bot token provided! Please set the DISCORD_TOKEN environment variable.');
    process.exit(1);
}

client.login(token);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});
