const cmd = require('../commands.js')
const config = require('../config.json')
const servers = require('./servers.json')
const users = require('./users.json')
const achievements = require('./achievements.json')
const fs = require('fs')
const chalk = require('chalk')

var prefix = config.misc.prefix

var log_info = chalk.bold.green('INFO: ')
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
    	var cmdArray = []
    	for (var i in cmd.execute) {
        if (cmd.execute[i].master == true) {
          if (msg.author.id == config.perms.master) {
            cmdArray.push(cmd.execute[i].name)
          }
        }
        else if (cmd.execute[i].admin == true) {
          if (servers[msg.guild.id].settings.admin.indexOf(msg.author.id) > -1) {
            cmdArray.push(cmd.execute[i].name)
          }
        }
        else {
          cmdArray.push(cmd.execute[i].name)
        }
      }
      return '``' + cmdArray.sort().join('``, ``') + '``'
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
        else {
          messageArray.push('Name: `' + cmd.execute[name].name + '`')
          messageArray.push('Description: `' + cmd.execute[name].desc + '`')
          messageArray.push('Usage: `' + cmd.execute[name].usage + '`')
          messageArray.push('Cooldown: `' + cmd.execute[name].cooldown + 'ms`')
          return messageArray
        }
      }
      else {
        return 'Oh ooh! Are you sure this is the right command? You can type `' + prefix + 'commands` for a full list of commands!'
      }
    }
  },
  server_create_object: {
    fn: function(server) {
      var object = {"settings": {"admin": [server.owner.id], "joinMessage": true, "leaveMessage": true, "customPrefix": "s."}, "custom": {"join": "Oh look! A person joined the server! I think their name is `$(user_name)`!", "leave": "Oh look! A person left the server! I think their name was `$(user_name)`!"}}
      servers[server.id] = object
      functions.servers_save.fn(servers)
    }
  },
  server_remove_object: {
    fn: function(server) {
      delete servers[server.id]
    }
  },
  user_create_object: {
    fn:function(user) {
      var object = {"name": user.username, "stats": {"commandsUsed": 1}, "achievement": [false, false, false, false, false, false]}
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
          server.defaultChannel.sendMessage(message)
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
          server.defaultChannel.sendMessage(message)
        }
      }
    }
  },
  servers_save: {
    fn: function(servers) {
      fs.writeFile("./data/servers.json", JSON.stringify(servers, null, 4), function(err){
          if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  users_save: {
    fn: function(users) {
      fs.writeFile("./data/users.json", JSON.stringify(users, null, 4), function(err){
          if (err) console.log(log_time() + log_err + err)
      })
    }
  },
  save_auto: {
    fn: function(servers, users) {
      console.log(log_time() + log_info + 'Server/User database saved!')
      functions.servers_save.fn(servers)
      functions.users_save.fn(users)
      setTimeout(() => {
        functions.save_auto.fn(servers, users)
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
      console.log(log_time() + log_info + 'Changed status to <' + config.useless.playing[status] + '>')
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
      console.log(log_time() + log_info + 'Updated ' + amount + ' servers!')
    }
  },
  update_users: {
    fn: function(bot) {
      var amount = 0
      for (var i in bot.users.array()) {
        if (users[bot.users.array()[i].id]) {
          //Nothing
        }
        else {
          amount = amount + 1
          functions.user_create_object.fn(bot.users.array()[i])
        }
      }
      console.log(log_time() + log_info + 'Updated ' + amount + ' users!')
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
      }
    }
  },
  uptime: {
    fn: function(seconds) {
      var uptimeSecNum = parseInt(seconds, 10)
      var uptimeHour = Math.floor(uptimeSecNum / 3600)
      var uptimeMin = Math.floor((uptimeSecNum - (uptimeHour * 3600)) / 60)
      var uptimeSec = (uptimeSecNum - (uptimeHour * 3600) - (uptimeMin * 60))
      return {"sec": uptimeSec, "hour": uptimeHour, "min": uptimeMin}
    }
  }
}

exports.execute = functions
