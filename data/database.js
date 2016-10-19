const cmd = require('../commands.js')
const logger = require('./logger.js')
const config = require('../config.json')
const servers = require('./servers.json')
const users = require('./users.json')
const blacklist = require('./blacklist.json')
const achievements = require('./achievements.json')
const fs = require('fs')
const chalk = require('chalk')
const request = require('request')

var prefix = config.misc.prefix

var log_info = chalk.bold.green('INFO: ')
var log_bot = chalk.bold.magenta('BOT: ')
var log_warn = chalk.bold.yellow('WARNING: ')
var log_err = chalk.bold.red('ERROR: ')
var log_time = function() {
  var date = new Date()
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var seconds = date.getSeconds()
  if (hours <= 9) {hours = '0' + hours}
  if (minutes <= 9) {minutes = '0' + minutes}
  if (seconds <= 9) {seconds = '0' + seconds}
  return chalk.bold.cyan('[' + hours + ':' + minutes + ':' + seconds + '] ')
}

var functions = {
  get_commands: {
    fn: function(msg) {
      var final = []
    	var defaultArray = []
      var defaultCount = 0
      var adminArray = []
      var adminCount = 0
      var masterArray = []
      var masterCount = 0
      for (var i in cmd.execute) {
        if (cmd.execute[i].master == true) {
          if (config.perms.master.indexOf(msg.author.id) > -1) {
            masterArray.push(cmd.execute[i].name)
            masterCount = masterCount + 1
          }
        }
        else if (cmd.execute[i].admin == true) {
          if (servers[msg.guild.id].settings.admin.indexOf(msg.author.id) > -1) {
            adminArray.push(cmd.execute[i].name)
            adminCount = adminCount + 1
          }
        }
        else {
          defaultArray.push(cmd.execute[i].name)
          defaultCount = defaultCount + 1
        }
      }
      if (defaultArray.length > 0) {
        final.push('**Default - ' + defaultCount + '**')
        final.push('``' + defaultArray.sort().join('``, ``') + '``')
        final.push(' ')
      }
      if (adminArray.length > 0) {
        final.push('**Admin - ' + adminCount + '**')
        final.push('``' + adminArray.sort().join('``, ``') + '``')
        final.push(' ')
      }
      if (masterArray.length > 0) {
        final.push('**Master - ' + masterCount + '**')
        final.push('``' + masterArray.sort().join('``, ``') + '``')
        final.push(' ')
      }
      return final
    }
  },
  get_help: {
    fn: function(msg, name) {
      var messageArray = []
      if (cmd.execute[name]) {
        if (cmd.execute[name].master == true) {
          if (msg.author.id == config.perms.master) {
            messageArray.push('Name: `' + cmd.execute[name].name + '`')
            messageArray.push('Description: `' + cmd.execute[name].desc + '`')
            messageArray.push('Usage: `' + cmd.execute[name].usage + '`')
            messageArray.push('Cooldown: `' + cmd.execute[name].cooldown + 'ms`')
            return messageArray
          }
        }
        if (cmd.execute[name].admin == true) {
          if (servers[msg.guild.id].settings.admin.indexOf(msg.author.id) > -1) {
            messageArray.push('Name: `' + cmd.execute[name].name + '`')
            messageArray.push('Description: `' + cmd.execute[name].desc + '`')
            messageArray.push('Usage: `' + cmd.execute[name].usage + '`')
            messageArray.push('Cooldown: `' + cmd.execute[name].cooldown + 'ms`')
            return messageArray
          }
        }
        else if (cmd.execute[name].admin == false && cmd.execute[name].owner == false) {
          messageArray.push('Name: `' + cmd.execute[name].name + '`')
          messageArray.push('Description: `' + cmd.execute[name].desc + '`')
          messageArray.push('Usage: `' + cmd.execute[name].usage + '`')
          messageArray.push('Cooldown: `' + cmd.execute[name].cooldown + 'ms`')
          return messageArray
        }
        else P
        messageArray.push('Uh oh! You can not see info of this comand... Type `' + prefix + 'help` for a lit of commands you can see.')
      }
      else {
        return 'Uh oh! This command does not exist! For a full list of commands, check out `' + prefix + 'help`.'
      }
    }
  },
  server_create_object: {
    fn: function(server) {
      var object = {"name": [server.name], "settings": {"admin": [server.owner.id], "joinMessage": false, "leaveMessage": false, "joinChannel": server.defaultChannel.id, "leaveChannel": server.defaultChannel.id, "customPrefix": "s.", "logger": {"enable": false, "channelId": server.defaultChannel.id}}, "custom": {"join": "Oh look! A person joined the server! I think their name is `$(user_name)`!", "leave": "Oh look! A person left the server! I think their name was `$(user_name)`!"}, "stats": {"messages": 0, "userjoins": 0, "userleaves": 0, "mentions": 0, "channelcreates": 0, "channeldeletes": 0, "rolecreates": 0, "roledeletes": 0, "banadds": 0, "banremoves": 0}}
      servers[server.id] = object
      functions.servers_save.fn(servers)
    }
  },
  server_remove_object: {
    fn: function(server) {
      delete servers[server.id]
      functions.servers_save.fn(servers)
    }
  },
  user_create_object: {
    fn:function(user) {
      var object = {"name": user.username, "stats": {"commandsUsed": 1, "rpcWins": 0}, "achievement": [false, false, false, false, false, false, false, false]}
      users[user.id] = object
      functions.users_save.fn(users)
    }
  },
  user_join: {
    fn: function(server, user) {
      if (servers[server.id]) {
        if (servers[server.id].settings.joinMessage == true) {
          var message = servers[server.id].custom.join
          if (message.indexOf('$(user_name)') >= 0 ) {
            message = message.replace('$(user_name)', user.user.username)
          }
          if (message.indexOf('$(server_name)') >= 0 ) {
            message = message.replace('$(server_name)', server.name)
          }
          server.channels.get(servers[server.id].settings.joinChannel).sendMessage(message)
        }
      }
    }
  },
  user_leave: {
    fn: function(server, user) {
      if (servers[server.id]) {
        if (servers[server.id].settings.leaveMessage == true) {
          var message = servers[server.id].custom.leave
          if (message.indexOf('$(user_name)') >= 0 ) {
            message = message.replace('$(user_name)', user.user.username)
          }
          if (message.indexOf('$(server_name)') >= 0 ) {
            message = message.replace('$(server_name)', server.name)
          }
          server.channels.get(servers[server.id].settings.leaveChannel).sendMessage(message)
        }
      }
    }
  },
  servers_save: {
    fn: function(servers) {
      fs.writeFile("./data/servers.json", JSON.stringify(servers, null, 4), function(err) {
          if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  users_save: {
    fn: function(users) {
      fs.writeFile("./data/users.json", JSON.stringify(users, null, 4), function(err) {
          if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  blacklist_save: {
    fn: function(blacklist) {
      fs.writeFile("./data/blacklist.json", JSON.stringify(blacklist, null, 4), function(err) {
        if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  save_auto: {
    fn: function(servers, users, blacklist) {
      console.log(log_time() + log_bot + 'Server/User/Blacklist database saved!')
      functions.servers_save.fn(servers)
      functions.users_save.fn(users)
      functions.blacklist_save.fn(blacklist)
      setTimeout(() => {
        functions.save_auto.fn(servers, users, blacklist)
      }, config.misc.autosave)
    }
  },
  command_log: {
    fn: function(name, msg) {
      console.log(log_time() + log_info + '<' + msg.author.username + '#' + msg.author.discriminator + '> used <' + name + '>')
    }
  },
  status_set_auto: {
    fn: function(bot) {
      var status = Math.floor(Math.random() * config.useless.playing.length)
      bot.user.setStatus('online', config.useless.playing[status])
      console.log(log_time() + log_bot + 'Changed status to <' + config.useless.playing[status] + '>')
      setTimeout(() => {
        functions.status_set_auto.fn(bot)
      }, config.misc.autostatus)
    }
  },
  update_servers: {
    fn: function(bot) {
      var amount = 0
      for (var i in bot.guilds.array()) {
        if (servers[bot.guilds.array()[i].id]) {
          //Nothing
        }
        else {
          amount = amount + 1
          functions.server_create_object.fn(bot.guilds.array()[i])
        }
      }
      console.log(log_time() + log_bot + 'Updated ' + amount + ' servers!')
    }
  },
  getAchievement: {
    fn: function(users, user) {
      var achievementArray = []
      for (var i in users[user.id].achievement) {
        if (users[user.id].achievement[i] == true) {
          achievementArray.push(achievements[i].emoji + ' | `' + achievements[i].desc + '`')
        }
        else {
          achievementArray.push(':no_entry: | ' + 'Not unlocked yet...')
        }
      }
      return achievementArray.join('\n')
    }
  },
  checkAchievement: {
    fn: function(users, msg) {
      for (var i in achievements) {
        if (achievements[i].type == 'commands_used') {
          if (achievements[i].needed <= users[msg.author.id].stats.commandsUsed && users[msg.author.id].achievement[i] == false) {
            msg.channel.sendMessage(':tada: You just unlocked a achievement! Type `' + prefix + 'achievements` to see it! :tada:')
            users[msg.author.id].achievement[i] = true
          }
          else {
            //Nothing
          }
        }
        else if (achievements[i].type == 'rpcWins') {
          if (achievements[i].needed <= users[msg.author.id].stats.rpcWins && users[msg.author.id].achievement[i] == false) {
            msg.channel.sendMessage(':tada: You just unlocked a achievement! Type `' + prefix + 'achievements` to see it! :tada:')
            users[msg.author.id].achievement[i] = true
          }
        }
      }
    }
  },
  uptime: {
    fn: function(seconds) {
      var uptimeSecNum = parseInt(seconds, 10)
      var uptimeHour = Math.floor(uptimeSecNum / 3600)
      var uptimeMin = Math.floor((uptimeSecNum - (uptimeHour * 3600)) / 60)
      var uptimeSec = (uptimeSecNum - (uptimeHour * 3600) - (uptimeMin * 60))
      if (uptimeSec < 10) {uptimeSec = '0' + uptimeSec}
      if (uptimeMin < 10) {uptimeMin = '0' + uptimeMin}
      if (uptimeHour < 10) {uptimeHour = '0' + uptimeHour}
      return {"sec": uptimeSec, "hour": uptimeHour, "min": uptimeMin}
    }
  },
  log: {
    fn: function(bot, user, guildId, channel, role, oldMessage, newMessage, msg, type) {
      if (servers[guildId]) {
        if (servers[guildId].settings.logger.enable == true) {
          var logChannel = servers[guildId].settings.logger.channelId
          if (type == 'user_join') {
            logger.execute.user_join.fn(bot, user, logChannel)
          }
          else if (type == 'user_leave') {
            logger.execute.user_leave.fn(bot, user, logChannel)
          }
          else if (type == 'user_ban_add') {
            logger.execute.user_ban_add.fn(bot, user, logChannel)
          }
          else if (type == 'user_ban_remove') {
            logger.execute.user_ban_remove.fn(bot, user, logChannel)
          }
          else if (type == 'channel_create') {
            logger.execute.channel_create.fn(bot, channel, logChannel)
          }
          else if (type == 'channel_delete') {
            logger.execute.channel_delete.fn(bot, channel, logChannel)
          }
          else if (type == 'role_create') {
            logger.execute.role_create.fn(bot, role, logChannel)
          }
          else if (type == 'role_delete') {
            logger.execute.role_delete.fn(bot, role, logChannel)
          }
          else if (type == 'message_delete') {
            logger.execute.message_delete.fn(bot, msg, logChannel)
          }
          else if (type == 'message_update') {
            logger.execute.message_update.fn(bot, oldMessage, newMessage, logChannel)
          }
        }
        else {
          //Nothing
        }
      }
      else {
        functions.update_servers.fn(bot)
      }
    }
  },
  get_time: {
    fn: function(date) {
      var hours = date.getHours()
      var minutes = date.getMinutes()
      var seconds = date.getSeconds()
      if (hours < 10) {hours = '0' + hours}
      if (minutes < 10) {minutes = '0' + minutes}
      if (seconds < 10) {seconds = '0' + seconds}
      return '[' + hours + ':' + minutes + ':' + seconds + ']'
    }
  },
  backup: {
    fn: function(users, blacklist, servers) {
      var date = new Date()
      var time = '[' + date.getHours()  + ';' + date.getMinutes() + ';' + date.getSeconds() + ']'
      var date = date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
      fs.writeFile('./backup/USERS/' + time + ' - ' + date + '.json', JSON.stringify(users, null, 4), function(err) {
        if (err) console.log(log_time() + log_err + err)
      })
      fs.writeFile('./backup/SERVERS/' + time + ' - ' + date + '.json', JSON.stringify(servers, null, 4), function(err) {
        if (err) console.log(log_time() + log_err + err)
      })
      fs.writeFile('./backup/BLACKLIST/' + time + ' - ' + date + '.json', JSON.stringify(blacklist, null, 4), function(err) {
        if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  backup_auto: {
    fn: function(users, blacklist, servers) {
      functions.backup.fn(users, blacklist, servers)
      console.log(log_time() + log_bot + 'Backup created!')
      setTimeout(() => {
        functions.backup_auto.fn(users, blacklist, servers)
      }, config.misc.autobackup)
    }
  },
}

exports.execute = functions
