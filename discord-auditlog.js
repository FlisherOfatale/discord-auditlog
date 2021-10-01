/*
Simple Discord.js module to log member-related event
Authors: Flisher
Other Contibutors: 
 DarylJG#9825

 */


module.exports = function (client, options) {
    const description = {
        name: "discord-auditlog",
        filename: "discord-auditlog.js",
        version: "3.0.3"
    }

    const eventtype = {
        guildMemberAdd: "movement",
        guildMemberRemove: "movement",
        guildBanAdd: "movement",
        guildBanRemove: "movement",
        guildMemberUpdate: "auditlog",
        usernameChangedMsg: "auditlog",
        discriminatorChangedMsg: "auditlog",
        avatarChangedMsg: "auditlog",
        messageDelete: "auditmsg",
        messageUpdate: "auditmsg",
        voiceStateUpdate: "voice"
    }
    console.log(`Module: ${description.name} | Loaded version ${description.version} from ("${description.filename}")`)

	const debug = false
    if (options && options.debugmode === true) debug = true
    const DiscordJSversion = require("discord.js").version.substring(0, 2)

    if (DiscordJSversion === '11') console.error("This version of discord-auditlog only run on DiscordJS V13 and up, please run \"npm i discord-playing@discord.js-v11\" to install an older version")
    if (DiscordJSversion === '12') console.error("This version of discord-auditlog only run on DiscordJS V13 and up, please run \"npm i discord-playing@discord.js-v12\" to install an older version")
    if (DiscordJSversion !== '13') return

    // Check that required Gateway Intention
    const {
        Intents
    } = require('discord.js');
    const liveIntent = new Intents(client.options.intents)
    const requiredIntent = ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
    const gotAllIntent = liveIntent.has(requiredIntent)

    if (gotAllIntent) {
        console.log(`Module: ${description.name} | Version ${description.version} initialized")`)
    } else {
        console.log(`Module: ${description.name} | Version ${description.version} NOT initialized due to the following reasons:")`)
        for (let i in requiredIntent) {
            let checkedIntent = requiredIntent[i]
            if (debug) console.log(`Module: ${description.name} | DEBUG | liveIntent: ${liveIntent}`)
            if (!liveIntent.has(requiredIntent[i])) {
                console.log(`Module: ${description.name} | Missing Gateway Intent ${requiredIntent[i]}`)
            }
        }
    }

    // Event Handlers
    /*
    COLORS
        :join:                         USER JOINED                 65280                    https://cdn.discordapp.com/emojis/435119354867220511.png
        :leave:                     USER LEFT                     16711680                https://cdn.discordapp.com/emojis/435119363595436042.png
        :kick:                         USER KICKED                 16748544                https://cdn.discordapp.com/emojis/435119368989573122.png
        :ban:                         USER BANNED                 16711901                https://cdn.discordapp.com/emojis/435119375138422811.png
        :unban:                        USER UNBANNED                16776960                https://cdn.discordapp.com/emojis/435462140900409344.png

        :nicknamechange:             NICKNAME UPDATE             29372                    https://cdn.discordapp.com/emojis/435119397237948427.png
        :usernamechange:             USERNAME UPDATE             29372                    https://cdn.discordapp.com/emojis/435119402279763968.png
        :avatarchange:                 AVATAR UPDATE                 29372                    https://cdn.discordapp.com/emojis/435119382910337024.png
        :discriminatorchange:         DISCRIMINATOR UPDATE         29372                    https://cdn.discordapp.com/emojis/435119390078271488.png

        :channeljoin:                 CHANNEL JOINED              3381555                    https://cdn.discordapp.com/emojis/435184638160404480.png
        :channelexit:                 CHANNEL LEFT                 10040115                https://cdn.discordapp.com/emojis/435174900227899393.png
        :channelchange:             CHANNEL SWITCH                 13421568                https://cdn.discordapp.com/emojis/435440286559371265.png

        :messageDelete:                MESSAGE DELETE                16711680                https://cdn.discordapp.com/emojis/619328827872641024.png
        :messageUpdate:                MESSAGE UPDATE                16737792                https://cdn.discordapp.com/emojis/619328813381320735.png
*/




    sleep = function (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    KickCheck = async function (member) { // DiscordJS V13

        /**
         *  Checks if the user has left or was kicked on their own decision 
         * 
         *      Produced for discord-auditlog
         *      Produced By: DarylJG#9825
         * 
         */
        return new Promise(async function (resolve, reject) {
            try {

                let guild = member.guild;

                // Throw an error and reject the promise if the bot does not have sufficient permission
                if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) console.error `Discord-AuditLog - Missing Permission To View Audit Log`;
                if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

                // Grab the last audit log entry for kicks
                const AuditLogFetch = await guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_KICK',
                });
                // console.log(AuditLogFetch)

                // If No Result is found return a promise false
                if (!AuditLogFetch || AuditLogFetch.entries.size === 0 ) return resolve(false);

                // TODO: Check more than 1 entry, iteratie trought result to check if it was a kick.
                const FirstEntry = AuditLogFetch.entries.first();


                // If there is no entry made in the audit log in the last 5 seconds, resolve false as user was not kicked recently 
                if (FirstEntry.createdTimestamp > (Date.now() - 6000) === false) return resolve(false);
                const {
                    executor,
                    target
                } = FirstEntry;

                // If user was kicked return an object containing information
                const Info = {
                    "user": target.username,
                    "id": target.id,
                    "kickedby": executor.username,
                    "reason": FirstEntry.reason,
                }

                return resolve(Info);

            } catch (e) {

                // Any unhandled issues above will reject the promise with an error
                reject(e);
            }
        });
    }

    // MESSAGE DELETE V13
    client.on("messageDelete", message => {
        if (debug) console.log(`Module: ${description.name} | DEBUG | messageDelete triggered`)
        if (!message || message.partial) return
        if (typeof message.author === "undefined") return
        if (message.author && message.author.bot === true) return

        // validate if it's from a guild
        let guildid = message.guildId || false
        if (!guildid) return

        if (message.author && message.author.bot === true) return

        let guild = client.guilds.cache.find(val => val.id === guildid)
        let channelid = message.channelId || false
        if (!channelid) return

        if (message.channel && message.channel.type !== "GUILD_TEXT") return
        var embed = {
            description: `
**Author : ** <@${message.author.id}> - *${message.author.tag}*
**Date : ** ${message.createdAt}
**Channel : ** <#${message.channel.id}> - *${message.channel.name}*

**Deleted Message : **
\`\`\`
${message.content.replace(/`/g, "'")}
\`\`\`

**Attachment URL : **
${message.attachments.map(x => x.proxyURL)}

`,
            image: {
                url: message.attachments.map(x => x.proxyURL)[0]
            },
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: `
            Deleted: `
            },
            author: {
                name: `
            MESSAGE DELETED `,
                icon_url: "https://cdn.discordapp.com/emojis/619328827872641024.png"
            }
        }
        if (message && message.member && typeof message.member.guild === "object") {
            send(client, message.member.guild, options, embed, "messageDelete")
        } else {
            console.error(`
            Module: $ {
                description.name
            } | messageDelete - ERROR - member guild id couldn 't be retrieved`)
            console.error("author", message.author)
            console.error("member", message.member)
            console.error("content", message.content)
        }
    })

    // MESSAGE UPDATE V13
    client.on("messageUpdate", (oldMessage, newMessage) => {
        if (debug) console.log(`Module: ${description.name} | DEBUG | messageUpdate triggered`)

        if (oldMessage.author.bot === true) return
        if (oldMessage.channel.type !== "GUILD_TEXT") return
        if (newMessage.channel.type !== "GUILD_TEXT") return

        if (oldMessage.content === newMessage.content) return
        var embed = {
            description: `
**Author : ** <@${newMessage.member.user.id}> - *${newMessage.member.user.tag}*
**Date : ** ${newMessage.createdAt}
**Channel : ** <#${newMessage.channel.id}> - *${newMessage.channel.name}*

**Orignal Message : **
\`\`\`
${oldMessage.content.replace(/`/g, "'")}
\`\`\`
**Updated Message : **
\`\`\`
${newMessage.content.replace(/`/g, "'")}
\`\`\`
`,
            color: 16737792,
            timestamp: new Date(),
            footer: {
                text: "Edited : "
            },
            author: {
                name: "MESSAGE EDITED",
                icon_url: "https://cdn.discordapp.com/emojis/619328813381320735.png"
            }
        }
        send(client, newMessage.member.guild, options, embed, "messageDelete")
    })

    // USER JOINED V13
    client.on("guildMemberAdd", member => {
        if (debug) console.log(`Module: ${description.name} | guildMemberAdd triggered`)
        var embed = {
            description: `<@${member.user.id}> - *${member.user.id}*\nUser Created on: ${new Date(member.user.createdTimestamp).toDateString()}`,
            url: member.user.displayAvatarURL(),
            color: 65280,
            timestamp: new Date(),
            footer: {
                text: `${member.nickname || member.user.username}`
            },
            thumbnail: {
                url: member.user.displayAvatarURL()
            },
            author: {
                name: `USER JOINED : ${member.user.tag}`,
                icon_url: "https://cdn.discordapp.com/emojis/435119354867220511.png"
            }
        }
        send(client, member.guild, options, embed, "guildMemberAdd")
    })

    // USER LEFT V13
    client.on("guildMemberRemove", async member => {
        if (debug) console.log(`Module: ${description.name} | guildMemberRemove triggered`)
        await sleep(5000)
        var embed = await KickCheck(member).then(MEMBER_KICK_INFO => {
            if (MEMBER_KICK_INFO) {
                // User was kicked
                return {
                    description: `<@${member.user.id}> - *${member.user.id}*`,
                    url: member.user.displayAvatarURL(),
                    color: 16748544,
                    timestamp: new Date(),
                    footer: {
                        text: `${member.nickname || member.user.username}`
                    },
                    thumbnail: {
                        url: member.user.displayAvatarURL()
                    },
                    author: {
                        name: `USER KICKED : ${member.user.tag} 
BY: ${MEMBER_KICK_INFO.kickedby} 
REASON: ${MEMBER_KICK_INFO.reason}`,
                        icon_url: "https://cdn.discordapp.com/emojis/435119363595436042.png"
                    },
                    fields: [{
                        name: "Nickname",
                        value: `**${member.nickname || member.user.username}**`,
                        inline: true
                    }]
                }
            }
        });
        if (typeof embed === "undefined") {
            // User was not kicked
            embed = {
                description: `<@${member.user.id}> - *${member.user.id}*`,
                url: member.user.displayAvatarURL(),
                color: 16711680,
                timestamp: new Date(),
                footer: {
                    text: `${member.nickname || member.user.username}`
                },
                thumbnail: {
                    url: member.user.displayAvatarURL()
                },
                author: {
                    name: `USER LEFT : ${member.user.tag}`,
                    icon_url: "https://cdn.discordapp.com/emojis/435119363595436042.png"
                },
                fields: [{
                    name: "Nickname",
                    value: `**${member.nickname || member.user.username}**`,
                    inline: true
                }]
            }

        }
        send(client, member.guild, options, embed, "guildMemberRemove")
    })

    // USER BANNED V13
    client.on("guildBanAdd", (guildban) => {
        if (debug) console.log(`Module: ${description.name} | guildBanAdd triggered`)
        let banuser = guildban.user

        var embed = {
            description: `<@${banuser.id}> - *${banuser.id}*`,
            url: banuser.displayAvatarURL(),
            color: 16711901,
            timestamp: new Date(),
            footer: {
                text: `${banuser.username}`
            },
            thumbnail: {
                url: banuser.displayAvatarURL()
            },
            author: {
                name: `USER BANNED : ${banuser.tag}`,
                icon_url: "https://cdn.discordapp.com/emojis/435119375138422811.png"
            }
        }
        send(client, guildban.guild, options, embed, "guildBanAdd")
    })

    // USER UNBANNED V13
    client.on("guildBanRemove", (guildban) => {
        if (debug) console.log(`Module: ${description.name} | guildBanRemove triggered`)
        let banuser = guildban.user
        var embed = {
            description: `<@${banuser.id}> - *${banuser.id}*`,
            url: banuser.displayAvatarURL(),
            color: 16776960,
            timestamp: new Date(),
            footer: {
                text: `${banuser.username}`
            },
            thumbnail: {
                url: banuser.displayAvatarURL()
            },
            author: {
                name: `USER UNBANNED : ${banuser.tag}`,
                icon_url: "https://cdn.discordapp.com/emojis/435462140900409344.png"
            }
        }
        send(client, guildban.guild, options, embed, "guildBanRemove")
    })

    // USER NICKNAME UPDATE V13
    client.on("guildMemberUpdate", (oldMember, newMember) => {
        if (debug) console.log(`Module: ${description.name} | guildMemberUpdate:nickname triggered`)
        if (oldMember.nickname !==
            newMember.nickname) {
            if (debug) console.log(`Module: ${description.name} | guildMemberUpdate:nickname validated`)
            var embed = {
                description: `<@${newMember.user.id}> - *${newMember.user.id}*`,
                url: newMember.user.displayAvatarURL(),
                color: 29372,
                timestamp: new Date(),
                footer: {
                    text: `${newMember.nickname || newMember.user.username}`
                },
                thumbnail: {
                    url: newMember.user.displayAvatarURL()
                },
                author: {
                    name: `NICKNAME CHANGED: ${newMember.user.tag}`,
                    icon_url: "https://cdn.discordapp.com/emojis/435119397237948427.png"
                },
                fields: [{
                        name: "Old Nickname",
                        value: `**${oldMember.nickname || oldMember.user.username}**`,
                        inline: true
                    },
                    {
                        name: "New Nickname",
                        value: `**${newMember.nickname || newMember.user.username}**`,
                        inline: true
                    }
                ]
            }
            // console.log(embed)
            send(client, newMember.guild, options, embed, "guildMemberUpdate")
        }
    })


    // MEMBER ROLE (Groups) UPDATE V13
    client.on("guildMemberUpdate", (oldMember, newMember) => {
        if (debug) console.log(`Module: ${description.name} | guildMemberUpdate:roles triggered`)

        // Initialize option if empty
        if (!options) {
            options = {}
        }

        if (options[newMember.guild.id]) {
            options = options[newMember.guild.id]
        }

        // Add default empty list
        if (typeof options.excludedroles === "undefined") options.excludedroles = new Array([])
        if (typeof options.trackroles === "undefined") options.trackroles = false

        // console.log(options.trackroles)

        if (options.trackroles !== false) {
            const oldMemberRoles = oldMember.roles.cache
            const newMemberRoles = newMember.roles.cache

            let rolechanged = newMemberRoles.difference(oldMemberRoles)
            options.excludedroles.forEach(function (key) {
                rolechanged.delete(key)
            })

            if (rolechanged.size !== 0) {
                if (debug) console.log(`Module: ${description.name} | guildMemberUpdate:rolechanged triggered`)

                // const oldRoles = oldMemberRoles.filter(x => !options.excludedroles.includes(x)).filter(x => !newMemberRoles.cache.includes(x))
                // const newRoles = newMemberRoles.filter(x => !options.excludedroles.includes(x)).filter(x => !oldMemberRoles.cache.includes(x))

                let roleadded = ""
                let roleremoved = ""

                rolechanged.forEach(function (key) {
                    if (newMemberRoles.has(key.id)) {
                        roleadded += `<@&${key.id}>`
                    } else {
                        roleremoved += `<@&${key.id}>`
                    }
                })

                var embed = {
                    description: `<@${newMember.user.id}> - *${newMember.user.id}*`,
                    url: newMember.user.displayAvatarURL(),
                    color: 29372,
                    timestamp: new Date(),
                    footer: {
                        text: `${newMember.nickname || newMember.user.username}`
                    },
                    thumbnail: {
                        url: newMember.user.displayAvatarURL()
                    },
                    author: {
                        name: `ROLES CHANGED: ${newMember.user.tag}`,
                        icon_url: "https://cdn.discordapp.com/emojis/435119397237948427.png"
                    },
                    fields: [{
                            name: "ROLES REMOVED",
                            value: `**${roleremoved} **`,
                            inline: true
                        },
                        {
                            name: "ROLES ADDED: ",
                            value: `**${roleadded} **`,
                            inline: true
                        }
                    ]
                }
                send(client, newMember.guild, options, embed, "guildMemberUpdate")
            }
        }
    })

    // USER UPDATE AVATAR, USERNAME, DISCRIMINATOR V13
    client.on("userUpdate", (oldUser, newUser) => {
        if (debug) console.log(`Module: ${description.name} | userUpdate triggered`)

        // Log quand le user change de username (et possiblement discriminator)
        var usernameChangedMsg = null
        var discriminatorChangedMsg = null
        var avatarChangedMsg = null

        // search the member from all guilds, since the userUpdate event doesn't provide guild information as it is a global event.
        client.guilds.cache.forEach(function (guild, guildid) {
            guild.members.cache.forEach(function (member, memberid) {
                if (newUser.id === memberid) {
                    // var member = bot.guilds.get(guildid).members.get(member.id)

                    // USERNAME CHANGED V13
                    if (oldUser.username !== newUser.username) {
                        if (debug) console.log(`Module: ${description.name} | userUpdate:USERNAME triggered`)

                        usernameChangedMsg = {
                            description: `<@${newUser.id}> - *${newUser.id}*`,
                            url: newUser.displayAvatarURL(),
                            color: 29372,
                            timestamp: new Date(),
                            footer: {
                                text: `${member.nickname || member.user.username}`
                            },
                            thumbnail: {
                                url: newUser.displayAvatarURL()
                            },
                            author: {
                                name: `USERNAME CHANGED: ${newUser.tag}`,
                                icon_url: "https://cdn.discordapp.com/emojis/435119402279763968.png"
                            },
                            fields: [{
                                    name: "Old Username",
                                    value: `**${oldUser.username}**`,
                                    inline: true
                                },
                                {
                                    name: "New Username",
                                    value: `**${newUser.username}**`,
                                    inline: true
                                }
                            ]
                        }
                    }

                    // DISCRIMINATOR CHANGED V13
                    if (oldUser.discriminator !== newUser.discriminator) {
                        if (debug) console.log(`Module: ${description.name} | userUpdate:DISCRIMINATOR triggered`)

                        discriminatorChangedMsg = {
                            description: `<@${newUser.id}> - *${newUser.id}*`,
                            url: newUser.displayAvatarURL(),
                            color: 29372,
                            timestamp: new Date(),
                            footer: {
                                text: `${member.nickname || member.user.username}`
                            },
                            thumbnail: {
                                url: newUser.displayAvatarURL()
                            },
                            author: {
                                name: `DISCRIMINATOR CHANGED: ${newUser.tag}`,
                                icon_url: "https://cdn.discordapp.com/emojis/435119390078271488.png"
                            },
                            fields: [{
                                    name: "Old Discriminator",
                                    value: `**${oldUser.discriminator}**`,
                                    inline: true
                                },
                                {
                                    name: "New Discriminator",
                                    value: `**${newUser.discriminator}**`,
                                    inline: true
                                }
                            ]
                        }
                    }

                    // AVATAR CHANGED V13
                    if (oldUser.avatar !== newUser.avatar) {
                        if (debug) console.log(`Module: ${description.name} | userUpdate:AVATAR triggered`)

                        avatarChangedMsg = {
                            description: `<@${newUser.id}> - *${newUser.id}*`,
                            url: newUser.displayAvatarURL(),
                            color: 29372,
                            timestamp: new Date(),
                            footer: {
                                text: `${member.nickname || member.user.username}`
                            },
                            thumbnail: {
                                url: newUser.displayAvatarURL()
                            },
                            author: {
                                name: `AVATAR CHANGED: ${newUser.tag}`,
                                icon_url: "https://cdn.discordapp.com/emojis/435119382910337024.png"
                            },
                            image: {
                                url: oldUser.displayAvatarURL()
                            },
                            fields: [{
                                name: "Old Avatar",
                                value: ":arrow_down:"
                            }]
                        }
                    }

                    if (usernameChangedMsg) send(client, guild, options, usernameChangedMsg, "usernameChangedMsg")
                    if (discriminatorChangedMsg) send(client, guild, options, discriminatorChangedMsg, "discriminatorChangedMsg")
                    if (avatarChangedMsg) send(client, guild, options, avatarChangedMsg, "avatarChangedMsg")
                }
            })
        })
    })

    // CHANNEL JOIN LEAVE SWITCH V13
    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (debug) console.log(`Module: ${description.name} | voiceStateUpdate triggered`)

        let userid = oldState.id || newState.id
        let guildid = oldState.guild.id || newState.guild.id
        let guild = client.guilds.cache.find(val => val.id === guildid)
        let author = guild.members.cache.find(val => val.id === userid)
        if (author && author.user.bot === true) return

        if (oldState.channel === null && newState.channel === null) return;

        var oldChannelName
        var newChannelName
        var embed

        // SET CHANNEL NAME STRING
        let oldparentname = "unknown"
        let oldchannelname = "unknown"
        let oldchanelid = "unknown"
        if (oldState && oldState.channel && oldState.channel.parent && oldState.channel.parent.name) oldparentname = oldState.channel.parent.name
        if (oldState && oldState.channel && oldState.channel.name) oldchannelname = oldState.channel.name
        if (oldState && oldState.channelId) oldchanelid = oldState.channelId

        let newparentname = "unknown"
        let newchannelname = "unknown"
        let newchanelid = "unknown"
        if (newState && newState.channel && newState.channel.parent && newState.channel.parent.name) newparentname = newState.channel.parent.name
        if (newState && newState.channel && newState.channel.name) newchannelname = newState.channel.name
        if (newState && newState.channelId) newchanelid = newState.channelId

        if (oldState.channelId && oldState.channel) {
            if (typeof oldState.channel.parent !== "undefined") {
                oldChannelName = `${oldparentname}\n\t**${oldchannelname}**\n*${oldchanelid}*`
            } else {
                oldChannelName = `-\n\t**${oldparentname}**\n*${oldchanelid}*`
            }
        }
        if (newState.channelId && newState.channel) {
            if (typeof newState.channel.parent !== "undefined") {
                newChannelName = `${newparentname}\n\t**${newchannelname}**\n*${newchanelid}*`
            } else {
                newChannelName = `-\n\t**${newchannelname}**\n*${newchanelid}*`
            }
        }

        // JOINED V13
        if (!oldState.channelId && newState.channelId && !oldState.channel && newState.channel) {
            if (debug) console.log(`Module: ${description.name} | voiceStateUpdate:JOINED triggered`)
            embed = {
                description: `<@${newState.member.user.id}> - *${newState.member.user.id}*`,
                url: newState.member.user.displayAvatarURL(),
                color: 3381555,
                timestamp: new Date(),
                footer: {
                    text: `${newState.member.nickname || newState.member.user.username}`
                },
                thumbnail: {
                    url: newState.member.user.displayAvatarURL()
                },
                author: {
                    name: `Joined channel : ${newState.member.user.tag}`,
                    icon_url: "https://cdn.discordapp.com/emojis/435184638160404480.png"
                },
                fields: [{
                    name: "Joined channel",
                    value: `${newChannelName}`
                }]
            }
        }


        // LEFT V13
        if (oldState.channelId && !newState.channelId && oldState.channel && !newState.channel) {
            if (debug) console.log(`Module: ${description.name} | voiceStateUpdate:LEFT triggered`)
            embed = {
                url: newState.member.user.displayAvatarURL(),
                color: 10040115,
                timestamp: new Date(),
                footer: {
                    text: `${newState.member.nickname || newState.member.user.username}`
                },
                thumbnail: {
                    url: newState.member.user.displayAvatarURL()
                },
                author: {
                    name: `Left channel : ${newState.member.user.tag}`,
                    icon_url: "https://cdn.discordapp.com/emojis/435174900227899393.png"
                },
                fields: [{
                    name: "Left channel",
                    value: `${oldChannelName}`
                }]
            }
        }


        // SWITCH V13
        if (oldState.channelId && newState.channelId && oldState.channel && newState.channel) {
            // False positive check
            if (oldState.channelId !== newState.channelId) {
                if (debug) console.log(`Module: ${description.name} | voiceStateUpdate:SWITCH triggered`)

                embed = {
                    description: `<@${newState.member.user.id}> - *${newState.member.user.id}*`,
                    url: newState.member.user.displayAvatarURL(),
                    color: 13421568,
                    timestamp: new Date(),
                    footer: {
                        text: `${newState.member.nickname || newState.member.user.username}`
                    },
                    thumbnail: {
                        url: newState.member.user.displayAvatarURL()
                    },
                    author: {
                        name: `Switched channel : ${newState.member.user.tag}`,
                        icon_url: "https://cdn.discordapp.com/emojis/435440286559371265.png"
                    },
                    fields: [{
                            name: "Left channel",
                            value: `${oldChannelName}`,
                            inline: true
                        },
                        {
                            name: "Joined channel",
                            value: `${newChannelName}`,
                            inline: true
                        }
                    ]
                }
            }
        }


        // SEND
        if (embed) {
            send(client, newState.guild, options, embed, "voiceStateUpdate")
        }
    })


    // SEND FUNCTION V13
    function send(client, guild, options, msg, movement) {
        let embed = ""

        if (debug) console.log(`Module: ${description.name} | DEBUG | send`)

        // Initialize option if empty
        if (!options) {
            options = {}
        }

        // Initialize if options are multi-server
        if (options[guild.id]) {
            options = options[guild.id]
        }

        // if (debug) console.log(`Module: ${description.name} | send - specifics options:`, options)

        // Add default channel
        if (typeof options.auditlog === "undefined") options.auditlog = "audit-log"
        if (typeof options.auditmsg === "undefined") options.auditmsg = false
        if (typeof options.movement === "undefined") options.movement = "in-out"
        if (typeof options.voice === "undefined") options.voice = false


        // if (debug) console.log(`Module: ${description.name} | send - computed options:`, options)

        const channelname = (options[eventtype[movement]])
        if (channelname) {
            // define channel object
            const channel = guild.channels.cache.find(val => val.name === channelname) || guild.channels.cache.find(val => val.id === channelname)
            if (channel) {
                if (channel.permissionsFor(client.user).has("SEND_MESSAGES") && channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
                    if (typeof msg === "object") {
                        // Embed
                        if (channel.permissionsFor(client.user).has("EMBED_LINKS")) {
                            embed = msg
                            channel.send({
                                    embeds: [embed]
                                })
                                .catch(console.error)
                        } else {
                            console.log(`${description.name} -> The Bot doesn't have the permission EMBED_LINKS to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`)
                        }
                    } else {
                        // Send the Message
                        channel.send(msg)
                            .catch(console.error)
                    }
                } else {
                    console.log(`${description.name} -> The Bot doesn't have the permission to send public message to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`)
                }
            } else {
                console.log(`${description.name} -> The channel "${channelname}" do not exist on server "${guild.name}" (${guild.id})`)
            }
        } else {
            // console.log(`AuditLog: No channel option for event ${movement} on server "${guild.name}" (${guild.id})`);
        }
    }


}