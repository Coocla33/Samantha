const db = require('./data/database.js')
const servers = require('./data/servers.json')
const users = require('./data/users.json')
const config = require('./config.json')
const blacklist = require('./data//blacklist.json')

var prefix = config.misc.prefix

var cmds = {
  'template': {
    'name': 'template',
    'desc': 'template',
    'usage': '<template>',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      msg.channel.sendMessage('template')
    }
  },
  'help': {
    'name': 'help',
    'desc': 'Helping users like you since 1989!',
    'usage': '<help> [command_name]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        msg.channel.sendMessage(db.execute.get_help.fn(msg, suffix.toLowerCase()))
      }
      else {
        msg.channel.sendMessage(db.execute.get_commands.fn(msg))
      }
    }
  },
  'customize': {
    'name': 'customize',
    'desc': 'Customize the bot for your server! For more brief overview, check the usage field!',
    'usage': '<customize> [set, enable, disable] [joinMessage, leaveMessage] [Custom_joinMessage, Custom_leaveMessage]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        if (suffix.toLowerCase().split(' ')[0] == 'enable') { //Enable
          if (suffix.toLowerCase().split(' ')[1] == 'joinmessage') { //Enable JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              msg.channel.sendMessage('This setting is already set to be enabled!')
            } else {
              servers[msg.guild.id].settings.joinMessage = true
              msg.channel.sendMessage('Enabled joinMessage!')
            }
          } else if (suffix.toLowerCase().split(' ')[1] == 'leavemessage') { //Enable LeaveMessage
            if (servers[msg.guild.id].settings.leaveMessage == true) {
              msg.channel.sendMessage('This setting is already set to be enabled!')
            } else {
              servers[msg.guild.id].settings.leaveMessage = true
              msg.channel.sendMessage('Enabled leaveMessage!')
            }
          } else {
           msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        } else if (suffix.toLowerCase().split(' ')[0] == 'disable') { //Disable
          if (suffix.toLowerCase().split(' ')[1] == 'joinmessage') { //Disable JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == false) {
              msg.channel.sendMessage('This setting is already set to be disabled!')
            } else {
              servers[msg.guild.id].settings.joinMessage = false
              msg.channel.sendMessage('Disabled joinMessage!')
            }
          } else if (suffix.toLowerCase().split(' ')[1] == 'leavemessage') { //Disable LeaveMessage
            if (servers[msg.guild.id].settings.leaveMessage == false) {
              msg.channel.sendMessage('This setting is already set to be disabled!')
            } else {
              servers[msg.guild.id].settings.leaveMessage = false
              msg.channel.sendMessage('Disabled leaveMessage!')
            }
          } else {
            msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        } else if (suffix.toLowerCase().split(' ')[0] == 'set') { //Set
          if (suffix.toLowerCase().split(' ')[1] == 'joinmessage') { //Setting JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              var message_split = suffix.split(' ')
              message = message_split.splice(2, message_split.length).join(' ')
              if (message) {
                servers[msg.guild.id].custom.join = message
                msg.channel.sendMessage('Changed the join message to: `' + message + '`')
              } else {
                msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
              }
            } else {
              msg.channel.sendMessage('Uh oh! Something went wrong! Are you sure you enabled the joinMessage? Type `' + prefix + 'help customize` to see how to enable it!')
            }
          } else if (suffix.toLowerCase().split(' ')[1] == 'leavemessage') { //Setting LeaveMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              var message_split = suffix.split(' ')
              message = message_split.splice(2, message_split.length).join(' ')
              if (message) {
                servers[msg.guild.id].custom.leave = message
                msg.channel.sendMessage('Changed the leave message to: `' + message + '`')
              } else {
                msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
              }
            } else {
              msg.channel.sendMessage('Uh oh! Something went wrong! Are you sure you enabled the joinMessage? Type `' + prefix + 'help customize` to see how to enable it!')
            }
          } else {
            msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        } else {
          msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
      }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
    }
  },
  'update': {
    'name': 'update_servers',
    'desc': 'Update all the servers to the servers.json',
    'usage': '<update_servers>',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      msg.channel.sendMessage('Check console for output!')
      db.execute.update_servers.fn(bot)
      db.execute.update_users.fn(bot)
    }
  },
  'addadmin': {
    'name': 'addAdmin',
    'desc': 'This adds people to the Bot Admin list!',
    'usage': '<addadmin> [user_mention]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size >= 0) {
        if (servers[msg.guild.id].settings.admin.indexOf(msg.mentions.users.array()[0].id) > -1) {
          msg.channel.sendMessage('This person is already a Bot Admin!')
        } else {
          servers[msg.guild.id].settings.admin[servers[msg.guild.id].settings.admin.length] = msg.mentions.users.array()[0].id
          msg.channel.sendMessage('Added `' + msg.mentions.users.array()[0].username + '` to the admin list of this server!')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help addAdmin` to see what you did wrong!')
      }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
    }
  },
  'removeadmin': {
    'name': 'removeAdmin',
    'desc': 'This removes people from the Bot Admin list!',
    'usage': '<removeadmin> [user_mention]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size >= 0) {
        if (msg.mentions.users.array()[0].id != msg.guild.owner.id) {
          if (servers[msg.guild.id].settings.admin.indexOf(msg.mentions.users.array()[0].id) > -1) {
            for (var i in servers[msg.guild.id].settings.admin) {
              if (servers[msg.guild.id].settings.admin[i] == msg.mentions.users.array()[0].id) {
                servers[msg.guild.id].settings.admin.splice(i, 1)
                msg.channel.sendMessage('Removed `' + msg.mentions.users.array()[0].username + '` from the admin list of this server!')
              }
            }
          } else {
            msg.channel.sendMessage('You need to add this person to the Bot Admin list before you can remove them!')
          }
        } else {
          msg.channel.sendMessage('You can not remove the creator of the server creator!')
        }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help addAdmin` to see what you did wrong!')
      }
    }
  },
  'adminlist': {
    'name': 'adminList',
    'desc': 'This shows all the people from the Bot Admin list!',
    'usage': '<adminlist>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var adminArray = []
      for (var i of servers[msg.guild.id].settings.admin) {
        adminArray.push(bot.fetchUser(i))
      }
      Promise.all(adminArray).then(admins => {
        msg.channel.sendMessage('``' + admins.map(a => a.username + '#' + a.discriminator).sort().join('``, ``') + '``')
      })
    }
  },
  'achievements': {
    'name': 'achievements',
    'desc': 'Shows all the achievements you\'ve got!',
    'usage': '<achievement>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      msg.channel.sendMessage(db.execute.getAchievement.fn(users, msg.author))
    }
  },
  'ping': {
    'name': 'ping',
    'desc': 'Ping pong!',
    'usage': '<ping>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var msg_time = Date.now()
      msg.channel.sendMessage('`Pong!` (Calculating...)').then(msg => {
	msg.edit('`Pong!` (' + (Date.now() - msg_time + ' ms)'))
      }).catch(console.error)
    }
  },
  'eval': {
    'name': 'eval',
    'desc': 'Doing some hardcore stuff',
    'usage': '<eval> [code]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      msg.channel.sendMessage('`Evaluating...`').then(msg => {
        try {
          var result = eval(suffix)
          if (typeof result !== 'object') {
            msg.edit('```Result:\n' + result + '```')
          }
        } catch (err) {
          if (config.misc.debug == true) {
            msg.edit('```Result:\n' + err.stack + '```')
          } else {
            msg.edit('```Result:\n' + err + '```')
          }
        }
      })
    }
  },
  'blacklist': {
    'name': 'blacklist',
    'desc': 'Just adding some people to the naughty list...',
    'usage': '<blacklist> [player_mention]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size > 0) {
        if (blacklist[msg.mentions.users.array()[0].id]) {
          msg.channel.sendMessage('This person is already in the blacklist! Noob.')
        } else {
          msg.channel.sendMessage('Added `' + msg.mentions.users.array()[0].username + '` to the blacklist!')
          blacklist[msg.mentions.users.array()[0].id] = {'date': new Date(), 'name': msg.mentions.users.array()[0].username}
          db.execute.blacklist_save.fn(blacklist)
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help blacklist` to see what you did wrong!')
      }
    }
  },
  'blacklistremove': {
    'name': 'blacklistRemove',
    'desc': 'Just removing some people from the naughty list...',
    'usage': '<blacklistremove> [player_mention]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size > 0) {
        if (blacklist[msg.mentions.users.array()[0].id]) {
          msg.channel.sendMessage('Removed `' + msg.mentions.users.array()[0].username + '` from the blacklist!')
          delete blacklist[msg.mentions.users.array()[0].id]
          db.execute.blacklist_save.fn(blacklist)
        } else {
          msg.channel.sendMessage('This person is not in the blacklist! So I can not remove him/her...')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help blacklist` to see what you did wrong!')
      }
    }
  },
  'naughtylist': {
    'name': 'naughtyList',
    'desc': 'Just showing the naughty list...',
    'usage': '<naughtylist>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var blacklistArray = []
      for (var i in blacklist) {
        var date = new Date(blacklist[i].date)
        blacklistArray.push(blacklist[i].name + ' | ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())
      }
      msg.channel.sendMessage('``' + blacklistArray.sort().join('``\n``') + '``')
    }
  },
  'inrole': {
    'name': 'inrole',
    'desc': 'Shows everybody that has a certain role',
    'usage': '<inrole> [role_name]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        var name = suffix
        if (msg.guild.roles.find('name', name)) {
          var messageArray = []
          var roleID = msg.guild.roles.find('name', name).id
          var membersWithRole = msg.guild.members.filter(m => m.roles.has(roleID))
          messageArray.push('`[' + membersWithRole.size  + ']`')
          messageArray.push('``' + membersWithRole.map(m => m.user.username).join('``, ``') + '``')
          msg.channel.sendMessage(messageArray)
        } else {
          msg.channel.sendMessage('Uh oh! That role does not exist! Type `' + prefix + 'serverinfo` to see a list of server roles and a lot more!')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help inrole` to see what you did wrong!')
      }
    }
  },
  'kill': {
    'name': 'kill',
    'desc': 'Killing people!',
    'usage': '<kill> [user_mentions, custom_text]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size > 0) {
        if (msg.mentions.users.array()[0].id == config.perms.master) {
          msg.channel.sendMessage('Sorry, I can not kill **' + msg.mentions.users.array()[0].username +  '** :(')
        } else {
          msg.channel.sendMessage('_Kills **' + msg.mentions.users.array()[0].username + '**_')
        }
      } else if (suffix) {
        if (['coocla33', 'samantha', 'misha'].indexOf(suffix.toLowerCase()) > -1) {
          msg.channel.sendMessage('Sorry, I can not kill **' + suffix + '** :(')
        } else {
          msg.channel.sendMessage('_Kills **' + suffix + '**_')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help kill` to see what you did wrong!')
      }
    }
  },
  'serverinfo': {
    'name': 'serverInfo',
    'desc': 'Shows everything about the server!',
    'usage': '<serverinfo>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var icon = msg.guild.iconURL
      if (icon == null) {icon = 'No icon...'}
      var emojis = msg.guild.emojis.map(e => e.name).join(', ')
      if (emojis == '') {emojis = 'No custom emojis...'}
      var messageArray = []
      var date = msg.guild.creationDate
      messageArray.push('```')
      messageArray.push('Name             : ' + msg.guild.name)
      messageArray.push('ID               : ' + msg.guild.id)
      messageArray.push('Members          : ' + msg.guild.memberCount)
      messageArray.push('Custom Emojis    : ' + emojis)
      messageArray.push('Channels         : ' + msg.guild.channels.size)
      messageArray.push('Creator          : ' + msg.guild.owner.user.username)
      messageArray.push('AFK              : ' + msg.guild.afkTimeout + 'sec')
      messageArray.push('Created          : ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())
      messageArray.push('DefaultChannel   : ' + msg.guild.defaultChannel.name)
      messageArray.push('Region           : ' + msg.guild.region)
      messageArray.push('Verification lvl : ' + msg.guild.verificationLevel)
      messageArray.push('Roles            : ' + msg.guild.roles.map(r => r.name).join(', '))
      messageArray.push('Icon             : ' + icon)
      messageArray.push('```')
      msg.channel.sendMessage(messageArray)
    }
  },
  'userinfo': {
    'name': 'userInfo',
    'desc': 'Shows stuff about yourself and stalking others!',
    'usage': '<userinfo> [user_mention]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var messageArray = []
      if (msg.mentions.users.size > 0) {
        var game = msg.mentions.users.array()[0].game
        if (game == null) {game = 'No game here!'} else {game = msg.mentions.users.array()[0].game.name}
        var avatarURL = msg.mentions.users.array()[0].avatarURL
        if (avatarURL == null) {avatarURL = 'No avatar...'}
        messageArray.push('```')
        messageArray.push('Name    : ' + msg.mentions.users.array()[0].username)
        messageArray.push('ID      : ' + msg.mentions.users.array()[0].id)
        messageArray.push('Discrim : ' + msg.mentions.users.array()[0].discriminator)
        messageArray.push('Status  : ' + msg.mentions.users.array()[0].status)
        messageArray.push('Game    : ' + game)
        messageArray.push('Bot     : ' + msg.mentions.users.array()[0].bot)
        messageArray.push('Icon    : ' + avatarURL)
        messageArray.push('```')
      } else {
        var game = msg.author.game
        if (game == null) {game = 'No game here!'} else {game = msg.author.game.name}
        var avatarURL = msg.author.avatarURL
        if (avatarURL == null) {avatarURL = 'No avatar...'}
        messageArray.push('```')
        messageArray.push('Name    : ' + msg.author.username)
        messageArray.push('ID      : ' + msg.author.id)
        messageArray.push('Discrim : ' + msg.author.discriminator)
        messageArray.push('Status  : ' + msg.author.status)
        messageArray.push('Game    : ' + game)
        messageArray.push('Bot     : ' + msg.author.bot)
        messageArray.push('Icon    : ' + avatarURL)
        messageArray.push('```')
      }
      msg.channel.sendMessage(messageArray)
    }
  },
  'logger': {
    'name': 'logger',
    'desc': 'Logging everything!',
    'usage': '<logger> [enable, disable, set]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        if (suffix.toLowerCase().split(' ')[0] == 'enable') { //Enable
          if (servers[msg.guild.id].settings.logger.enable == false) {
            msg.channel.sendMessage('Logger enabled!')
            servers[msg.guild.id].settings.logger.enable = true
            db.execute.servers_save.fn(servers)
          } else {
            msg.channel.sendMessage('Uh oh! You can not enable something that is already enabled!')
          }
        } else if (suffix.toLowerCase().split(' ')[0] == 'disable') { //Disable
          if (servers[msg.guild.id].settings.logger.enable == true) {
            msg.channel.sendMessage('Logger disabled!')
            servers[msg.guild.id].settings.logger.enable = false
            db.execute.servers_save.fn(servers)
          } else {
            msg.channel.sendMessage('Uh oh! You can not disable something that is already disabled!')
          }
        } else if (suffix.toLowerCase().split(' ')[0] == 'set') { //Set
          msg.channel.sendMessage('Logging channel set to: `' + msg.channel.id + '`!')
          servers[msg.guild.id].settings.logger.channelId = msg.channel.id
          db.execute.servers_save.fn(servers)
        } else {
          msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help logger` to see what you did wrong!')
        }
      } else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help logger` to see what you did wrong!')
      }
    }
  },
  'info': {
    'name': 'info',
    'desc': 'Just some standard info about Samantha!',
    'usage': '<info>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var messageArray = []
      messageArray.push('About: `Samantha is a discord bot, duhh... But samantha is designed to make the life of a user better! From the server staff to a simple user that just joined for fun.`')
      messageArray.push('Version: `Fuck versions. I am just half finished`')
      messageArray.push('Github: `https://github.com/Coocla33/Samantha`')
      messageArray.push('Wiki: `https://github.com/Coocla33/Samantha/wiki`')
      messageArray.push('Creator: `Coocla33#6115 (154923436831932416)`')
      messageArray.push('Samantha Server: `https://www.discord.gg/nKCywwZ`')
      messageArray.push('Disclaimer: `Atm I am a private bot only allowed in certain servers for testing, I will become public eventually...`')
      msg.channel.sendMessage(messageArray)
    }
  },
  'rate': {
    'name': 'rate',
    'desc': 'I literaly rate everything!',
    'usage': '<rate> [custom_text]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var random = Math.floor((Math.random() * 10) + 1)
      var randomComma = Math.floor((Math.random() * 9) + 1)
      if (suffix.toLowerCase() == 'samantha') {
        msg.channel.sendMessage('I rate `myself` 11/10! :heart:  :sparkles:')
      } else if (suffix.toLowerCase() == 'coocla33' || suffix.toLowerCase() == 'misha') {
        msg.channel.sendMessage('I rate `' + suffix + '` over 9000!')
      } else if (suffix){
        if (random == 5) {
          msg.channel.sendMessage('I rate `' + suffix + '` 5/7!')
        } else if (random == 10) {
          msg.channel.sendMessage('I rate `' + suffix + '` ' + random + '/10!')
        } else {
          msg.channel.sendMessage('I rate `' + suffix + '` ' + random + '.' + randomComma + '/10!')
        }
      }
      else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help rate` to see what you did wrong!')
      }
    }
  },
  'topservers': {
    'name': 'topServers',
    'desc': 'Shows the 10 biggest servers that i am in!',
    'usage': '<topservers> [amount_number]',
    'cooldown': 30000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var mappedGuilds = []
      var final = []
      bot.guilds.forEach((guild) => {
        mappedGuilds.push({id: guild.id, memberCount: guild.memberCount})
      })
      mappedGuilds = mappedGuilds.sort(function(a, b) {return a.memberCount - b.memberCount}).reverse()
      if (suffix) {
        if (isNaN(suffix)) {
          msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help topservers` to see what you did wrong!')
        }
        else {
          if (suffix <= 20) {
            for (var i = 0; i < suffix; i++) {
              if (mappedGuilds[i]) {
                final.push('`[' + (i + 1) + ']` **' + bot.guilds.get(mappedGuilds[i].id).name + '** - *' + bot.guilds.get(mappedGuilds[i].id).memberCount + ' Members*')
              }
              else {
                //Nothing
              }
            }
          }
          else {
            msg.channel.sendMessage('The maximum amount of servers you can fetch is `20`!')
          }
        }
      }
      else {
        for (var i = 0; i < 5; i++) {
          final.push('`[' + (i + 1) + ']` **' + bot.guilds.get(mappedGuilds[i].id).name + '** - *' + bot.guilds.get(mappedGuilds[i].id).memberCount + ' Members*')
        }
      }
      msg.channel.sendMessage(final)
    }
  },
  'say': {
    'name': 'say',
    'desc': 'Saying stuff',
    'usage': '<say> [suffix]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        msg.channel.sendMessage(suffix)
      }
    }
  },
  'botinfo': {
    'name': 'botInfo',
    'desc': 'Shows all the bot information!',
    'usage': '<botinfo>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var messageArray = []
      var uptime = db.execute.uptime.fn(bot.uptime / 1000)
      messageArray.push('```')
      messageArray.push('Name     : ' + bot.user.username + '#' + bot.user.discriminator)
      messageArray.push('ID       : ' + bot.user.id)
      messageArray.push('Channels : ' + bot.channels.size)
      messageArray.push('Guilds   : ' + bot.guilds.size)
      messageArray.push('Users    : ' + bot.users.size)
      messageArray.push('Uptime   : ' + uptime.hour + ':' + uptime.min + ':' + uptime.sec + ' (Hour : Min : Sec)')
      messageArray.push('```')
      msg.channel.sendMessage(messageArray)
    }
  },
  'dice': {
    'name': 'dice',
    'desc': 'Wanna play some dice games?',
    'usage': '<dice> [number]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var random
      if (suffix) {
        if (isNaN(suffix)) {
          msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help dice` to see what you did wrong!')
        }
        else {
          random = Math.floor((Math.random() * suffix) + 1)
          msg.channel.sendMessage('You threw a `' + random + '`')
        }
      }
      else {
        random = Math.floor((Math.random() * 6) + 1)
        msg.channel.sendMessage('You threw a `' + random + '`')
      }
    }
  },
  'request': {
    'name': 'request',
    'desc': 'Do you think you have a good idea? Request it here!',
    'usage': '<request> [idea]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        msg.channel.sendMessage('Request sent to the `Samantha Server`!')
        bot.channels.get(config.misc.requestChannel).sendMessage('Request by `' + msg.author.username + '#' + msg.author.discriminator + '` on the server `' + msg.guild.name + '`: `' + suffix + '`')
      }
      else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help request` to see what you did wrong!')
      }
    }
  },
  'cc': {
    'name': 'cc',
    'desc': 'CooclaCommands! These are commands from one of my first bot! Thanks to Bluetail#0772 for more then half of the command ideas',
    'usage': '<cc> [command]',
    'cooldown': 15000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        suffix = suffix.toLowerCase()
        if (suffix == 'why') {
          msg.channel.sendMessage('But why? http://imgur.com/TnQRX6v')
        }
        else if (suffix == 'pirate') {
          msg.channel.sendMessage('Pirate life is great! https://www.youtube.com/watch?v=IBH4g_ua5es')
        }
        else if (suffix == 'hi') {
          msg.channel.sendMessage('Well hello there ' + msg.author.username + '. What are you doing in this digital world?')
        }
        else if (suffix == 'hype') {
          msg.channel.sendMessage('*Throws confetti :confetti_ball: sunshine! :sunny: and rainbows :rainbow:!!!*')
        }
        else if (suffix == 'kappa') {
          msg.channel.sendMessage('Kappa: http://giphy.com/gifs/ultimate-kappa-MGLPENCNLcy8o')
        }
        else if (suffix == 'hypeno') {
          msg.channel.sendMessage("*Confetti gets buried after you realize it's a bad idea*")
        }
        else if (suffix == 'apple') {
          msg.channel.sendMessage('An apple a day, keeps the doctor away!')
        }
        else if (suffix == 'banana') {
          msg.channel.sendMessage('banana: https://www.youtube.com/watch?v=sFukyIIM1XI')
        }
        else if (suffix == 'hypenoidea') {
          msg.channel.sendMessage("*you are so hyped but you don't know what's going on* :joy:")
        }
        else if (suffix == 'sans') {
          msg.channel.sendMessage('GEET DUNKED ON!!')
        }
        else if (suffix == 'tomato') {
          msg.channel.sendMessage('potato')
        }
        else if (suffix == 'potato') {
          msg.channel.sendMessage('tomato')
        }
        else if (suffix == 'airhorn') {
          msg.channel.sendMessage('DUUUHHH!!!')
        }
        else if (suffix == 'ded') {
          msg.channel.sendMessage('*Is ded.*')
        }
        else if (suffix == 'illuminatie') {
          msg.channel.sendMessage('Illuminati Confirmed: http://giphy.com/gifs/animation-pizza-illuminati-bi1dfmrAxEGyc')
        }
        else if (suffix == 'panic') {
          msg.channel.sendMessage('*ALL IS LOST!!!*')
        }
        else if (suffix == 'derp') {
          msg.channek.sendMessage(msg.author.username + ' is derping around.')
        }
        else if (suffix == 'love') {
          msg.channel.sendMessage('I love you to ' + msg.author.username + ' <3')
        }
        else if (suffix == 'hug') {
          msg.channel.sendMessage('*Hugs ' + msg.author.username + '*')
        }
        else if (suffix == 'confused') {
          msg.channel.sendMessage('*' + msg.author.username + ' is confused.*')
        }
        else if (suffix == 'cry') {
          msg.channel.sendMessage('*' + msg.author.username + ' is crying in a corner...*')
        }
        else {
          msg.channel.sendMessage('Oh ooh! That command aint here... Type `' + prefix + 'cc` to see all the commands!')
        }
      }
      else {
        var messageArray = []
        var commandArray = ["why", "pirate", "hi", "hype", "kappa", "hypeno", "apple", "banana", "hypenoidea", "sans", "tomato", "potato", "airhorn", "ded", "illuminatie", "panic", "derp", "love", "hug", "confused", "cry"]
        messageArray.push('**CooclaCommands - ' + commandArray.length + '**')
        messageArray.push('``' + commandArray.sort().join('``, ``') + '``')
        msg.channel.sendMessage(messageArray)
      }
    }
  },
  'rpc': {
    'name': 'rpc',
    'desc': 'Rock Paper Scissors!',
    'usage': '<rcps> [rock, paper, scissor]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        var random = Math.floor((Math.random() * 3) + 1)
        var choice = 'nothing'
        if (random == 1) {choice = 'rock'}
        if (random == 2) {choice = 'paper'}
        if (random == 3) {choice = 'scissor'}
        if (suffix.toLowerCase() == 'rock') {
          if (choice == 'paper') { //Lose
            msg.channel.sendMessage('You lose! Samantha used **Paper**!')
          }
          else if (choice == 'scissor') { //Win
            msg.channel.sendMessage('You win! Samantha used **Scissor**!')
            users[msg.author.id].stats.rpcWins += 1
          }
          else { //Tie
            msg.channel.sendMessage('It is a tie!')
          }
        }
        else if (suffix.toLowerCase() == 'paper') {
          if (choice == 'scissor') { //Lose
            msg.channel.sendMessage('You lose! Samantha used **Scissor**!')
          }
          else if (choice == 'rock') { //Win
            msg.channel.sendMessage('You win! Samantha used **Rock**!')
            users[msg.author.id].stats.rpcWins += 1
          }
          else { //Tie
            msg.channel.sendMessage('It is a tie!')
          }
        }
        else if (suffix.toLowerCase() == 'scissor') {
          if (choice == 'rock') { //Lose
            msg.channel.sendMessage('You lose! Samantha used **Rock**!')
          }
          else if (choice == 'paper') { //Win
            msg.channel.sendMessage('You win! Samantha used **Paper**!')
            users[msg.author.id].stats.rpcWins += 1
          }
          else { //Tie
            msg.channel.sendMessage('It is a tie!')
          }
        }
        else {
          msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help rpc` to see what you did wrong!')
        }
      }
      else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help rpc` to see what you did wrong!')
      }
    }
  },
  '8ball': {
    'name': '8ball',
    'desc': 'I. Know. Everything.',
    'usage': '<8ball> [suffix]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        var answer = ['It is certain', 'It is decidedly so', 'Without a doubt', 'Yes – definitely', 'You may rely on it', 'As I see it, yes', 'Most likely', 'Outlook good', 'Yes', 'Signs point to yes', 'Reply hazy, try again', 'Ask again later', 'Better not tell you now', 'Cannot predict now', 'Concentrate and ask again', "Don't count on it", 'My reply is no', 'My sources say no', 'Outlook not so good', 'Very doubtful']
        var random = Math.floor((Math.random() * answer.length) + 1)
        msg.channel.sendMessage(answer[random])
      }
      else {
        msg.channel.sendMessage('Uh oh! Something went wrong! Type `' + prefix + 'help 8ball` to see what you did wrong!')
      }
    }
  },
  'save': {
    'name': 'save',
    'desc': 'I may save your life...',
    'usage': '<save>',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      db.execute.users_save.fn(users)
      db.execute.servers_save.fn(servers)
      msg.channel.sendMessage('Saved!')
    }
  }
}

exports.execute = cmds
