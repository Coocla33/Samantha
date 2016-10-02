const db = require('./data/database.js')
const servers = require('./data/servers.json')
const users = require('./data/users.json')
const config = require('./config.json')
const blacklist = require('./data//blacklist.json')

var prefix = config.misc.prefix

var cmds = {
  template: {
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
  commands: {
    'name': 'commands',
    'desc': 'A list of all the commands!',
    'usage': '<commands>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var messageArray = []
      messageArray.push('Commands:')
      messageArray.push(db.execute.get_commands.fn(msg))
      msg.channel.sendMessage(messageArray)
    }
  },
  help: {
    'name': 'help',
    'desc': 'Helping users like you since 1989!',
    'usage': '<help> [command_name]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        msg.channel.sendMessage(db.execute.get_help.fn(msg, suffix))
      }
      else {
        msg.channel.sendMessage('Oh ooh! You forgot to mention a command name! Use the command like this: `<help> [command_name]`!')
      }
    }
  },
  customize: {
    'name': 'customize',
    'desc': 'Customizing the entire bot! There are 2 tags for the join/leave messages! $(user_name) & $(server_name)',
    'usage': '<customize> [set, enable, disable] [joinMessage, leaveMessage] [Custom_joinMessage, Custom_leaveMessage]',
    'cooldown': 5000,
    'master': false,
    'admin': true,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        if (suffix.toLowerCase().split(' ')[0] == 'enable') { //Enable
          if (suffix.toLowerCase().split(' ')[1] == 'joinMessage') { //Enable JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              msg.channel.sendMessage('This setting is already set to be enabled!')
            }
            else {
              servers[msg.guild.id].settings.joinMessage = true
              msg.channel.sendMessage('Enabled joinMessage!')
            }
          }
          else if (suffix.toLowerCase().split(' ')[1] == 'leaveMessage') { //Enable LeaveMessage
            if (servers[msg.guild.id].settings.leaveMessage == true) {
              msg.channel.sendMessage('This setting is already set to be enabled!')
            }
            else {
              servers[msg.guild.id].settings.leaveMessage = true
              msg.channel.sendMessage('Enabled leaveMessage!')
            }
          }
          else {
           msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        }
        else if (suffix.toLowerCase().split(' ')[0] == 'disable') { //Disable
          if (suffix.toLowerCase().split(' ')[1] == 'joinMessage') { //Disable JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == false) {
              msg.channel.sendMessage('This setting is already set to be disabled!')
            }
            else {
              servers[msg.guild.id].settings.joinMessage = false
              msg.channel.sendMessage('Disabled joinMessage!')
            }
          }
          else if (suffix.toLowerCase().split(' ')[1] == 'leaveMessage') { //Disable LeaveMessage
            if (servers[msg.guild.id].settings.leaveMessage == false) {
              msg.channel.sendMessage('This setting is already set to be disabled!')
            }
            else {
              servers[msg.guild.id].settings.leaveMessage = false
              msg.channel.sendMessage('Disabled leaveMessage!')
            }
          }
          else {
            msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        }
        else if (suffix.toLowerCase().split(' ')[0] == 'set') { //Set
          if (suffix.toLowerCase().split(' ')[1] == 'joinMessage') { //Setting JoinMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              var message_split = suffix.split(' ')
              message = message_split.splice(2, message_split.length).join(' ')
              if (message) {
                servers[msg.guild.id].custom.join = message
                msg.channel.sendMessage('Changed the join message to: `' + message + '`')
              }
              else {
                msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
              }
            }
            else {
              msg.channel.sendMessage('Oh ooh! Something went wrong! Are you sure you enabled the joinMessage? Type `' + prefix + 'help customize` to see how to enable it!')
            }
          }
          else if (suffix.toLowerCase().split(' ')[1] == 'leavemessage') { //Setting LeaveMessage
            if (servers[msg.guild.id].settings.joinMessage == true) {
              var message_split = suffix.split(' ')
              message = message_split.splice(2, message_split.length).join(' ')
              if (message) {
                servers[msg.guild.id].custom.leave = message
                msg.channel.sendMessage('Changed the leave message to: `' + message + '`')
              }
              else {
                msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
              }
            }
            else {
              msg.channel.sendMessage('Oh ooh! Something went wrong! Are you sure you enabled the joinMessage? Type `' + prefix + 'help customize` to see how to enable it!')
            }
          }
          else {
            msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
          }
        }
        else {
          msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help customize` to see what you did wrong!')
      }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
    }
  },
  update: {
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
  addadmin: {
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
        }
        else {
          servers[msg.guild.id].settings.admin[servers[msg.guild.id].settings.admin.length] = msg.mentions.users.array()[0].id
          msg.channel.sendMessage('Added `' + msg.mentions.users.array()[0].username + '` to the admin list of this server!')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help addAdmin` to see what you did wrong!')
      }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
    }
  },
  removeadmin: {
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
          }
          else {
            msg.channel.sendMessage('You need to add this person to the Bot Admin list before you can remove them!')
          }
        }
        else {
          msg.channel.sendMessage('You can not remove the creator of the server creator!')
        }
      db.execute.servers_save.fn(servers) //Saving to Servers.json
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help addAdmin` to see what you did wrong!')
      }
    }
  },
  adminlist: {
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
  achievements: {
    'name': 'achievements',
    'desc': 'Showing all the achievements you got!',
    'usage': '<achievement>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      msg.channel.sendMessage(db.execute.getAchievement.fn(users, msg.author))
    }
  },
  ping: {
    'name': 'ping',
    'desc': 'Ping pong!',
    'usage': '<ping>',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var msg_time = Date.now()
			msg.channel.sendMessage('`Pong!` (Calculating...)')
			.then(msg => {
				msg.edit('`Pong!` (' + (Date.now() - msg_time + ' ms)'))
			}).catch(console.error)
    }
  },
  eval: {
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
        }
        catch (err) {
          if (config.misc.debug == true) {
            msg.edit('```Result:\n' + err.stack + '```')
          }
          else {
            msg.edit('```Result:\n' + err + '```')
          }
        }
      })
    }
  },
  uptime: {
    'name': 'uptime',
    'desc': 'The uptime of the bot!',
    'usage': '<uptime>',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      var uptime = db.execute.uptime.fn(bot.uptime / 1000)
      msg.channel.sendMessage('Uptime: ' + uptime.hour + ':' + uptime.min + ':' + uptime.sec)
    }
  },
  blacklist: {
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
        }
        else {
          msg.channel.sendMessage('Adding `' + msg.mentions.users.array()[0].username + '` to the blacklist!')
          blacklist[msg.mentions.users.array()[0].id] = {'date': new Date(), 'name': msg.mentions.users.array()[0].username}
          db.execute.blacklist_save.fn(blacklist)
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help blacklist` to see what you did wrong!')
      }
    }
  },
  blacklistremove: {
    'name': 'blacklistRemove',
    'desc': 'Just removing some people to the naughty list...',
    'usage': '<blacklistremove> [player_mention]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size > 0) {
        if (blacklist[msg.mentions.users.array()[0].id]) {
          msg.channel.sendMessage('Removing `' + msg.mentions.users.array()[0].username + '` from the blacklist!')
          delete blacklist[msg.mentions.users.array()[0].id]
          db.execute.blacklist_save.fn(blacklist)
        }
        else {
          msg.channel.sendMessage('This person is not in the blacklist! So i can not remove him/her...')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help blacklist` to see what you did wrong!')
      }
    }
  },
  naughtylist: {
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
  inrole: {
    'name': 'inrole',
    'desc': 'Showing everybody that has a certain role',
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
        }
        else {
          msg.channel.sendMessage('Oh ooh! That role does not exist!')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help inrole` to see what you did wrong!')
      }
    }
  },
  kill: {
    'name': 'kill',
    'desc': 'Killing people!',
    'usage': '<kill> [user_mentions, custom_text]',
    'cooldown': 5000,
    'master': false,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (msg.mentions.users.size > 0) {
        if (msg.mentions.users.array()[0].id == config.perms.master) {
          msg.channel.sendMessage('Sorry, i can not kill **' + msg.mentions.users.array()[0].username +  '** :(')
        }
        else {
          msg.channel.sendMessage('_Kills **' + msg.mentions.users.array()[0].username + '**_')
        }
      }
      else if (suffix) {
        if (suffix == 'coocla33' || suffix == 'Coocla33' || suffix == 'samantha' || suffix == 'Samantha' || suffix == 'misha' || suffix == 'Misha') {
          msg.channel.sendMessage('Sorry, i can not kill **' + suffix + '** :(')
        }
        else {
          msg.channel.sendMessage('_Kills **' + suffix + '**_')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help kill` to see what you did wrong!')
      }
    }
  },
  serverinfo: {
    'name': 'serverInfo',
    'desc': 'Showing everything about the server!',
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
      messageArray.push('Id               : ' + msg.guild.id)
      messageArray.push('Members          : ' + msg.guild.memberCount)
      messageArray.push('Custom Emojis    : ' + emojis)
      messageArray.push('Channels         : ' + msg.guild.channels.size)
      messageArray.push('Creator          : ' + msg.guild.owner.user.username)
      messageArray.push('Afk              : ' + msg.guild.afkTimeout + 'sec')
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
  userinfo: {
    'name': 'userInfo',
    'desc': 'Showing stuff about yourself and stalking others!',
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
        messageArray.push('Id      : ' + msg.mentions.users.array()[0].id)
        messageArray.push('Discrim : ' + msg.mentions.users.array()[0].discriminator)
        messageArray.push('Status  : ' + msg.mentions.users.array()[0].status)
        messageArray.push('Game    : ' + game)
        messageArray.push('Bot     : ' + msg.mentions.users.array()[0].bot)
        messageArray.push('Icon    : ' + avatarURL)
        messageArray.push('```')
      }
      else {
        var game = msg.author.game
        if (game == null) {game = 'No game here!'} else {game = msg.author.game.name}
        var avatarURL = msg.author.avatarURL
        if (avatarURL == null) {avatarURL = 'No avatar...'}
        messageArray.push('```')
        messageArray.push('Name    : ' + msg.author.username)
        messageArray.push('Id      : ' + msg.author.id)
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
  logger: {
    'name': 'logger',
    'desc': 'logging everything!',
    'usage': '<logger> [enable, disable, set]',
    'cooldown': 5000,
    'master': true,
    'admin': false,
    fn: function(bot, msg, suffix) {
      if (suffix) {
        if (suffix.toLowerCase().split(' ')[0] == 'enable') { //Enable
          if (servers[msg.guild.id].settings.logger.enable == false) {
            msg.channel.sendMessage('Logger enabled!')
            servers[msg.guild.id].settings.logger.enable = true
            db.execute.servers_save.fn(servers)
          }
          else {
            msg.channel.sendMessage('Oh ooh! You can not enable something that is already enabled!')
          }
        }
        else if (suffix.toLowerCase().split(' ')[0] == 'disable') { //Disable
          if (servers[msg.guild.id].settings.logger.enable == true) {
            msg.channel.sendMessage('Logger enabled!')
            servers[msg.guild.id].settings.logger.enable = false
            db.execute.servers_save.fn(servers)
          }
          else {
            msg.channel.sendMessage('Oh ooh! You can not disable something that is already disabled!')
          }
        }
        else if (suffix.toLowerCase().split(' ')[0] == 'set') { //Set
          msg.channel.sendMessage('Logging channel set to: `' + msg.channel.id + '`!')
          servers[msg.guild.id].settings.logger.channelId = msg.channel.id
          db.execute.servers_save.fn(servers)
        }
        else {
          msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help logger` to see what you did wrong!')
        }
      }
      else {
        msg.channel.sendMessage('Oh ooh! Something went wrong! Type `' + prefix + 'help logger` to see what you did wrong!')
      }
    }
  }
}

exports.execute = cmds
