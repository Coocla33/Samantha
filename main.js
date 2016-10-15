const Discord = require('discord.js')
const chalk = require('chalk')
const cmd = require('./commands.js')
const config = require('./config.json')
const db = require('./data/database.js')
const servers = require('./data/servers.json')
const users = require('./data/users.json')
const blacklist = require('./data/blacklist.json')

var bot = new Discord.Client()

var prefix = config.misc.prefix
var user_cooldown = {}

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

//Startup Sequence
console.log(log_time() + log_bot + 'Starting up ' + config.misc.bot_name + '!')
var startup = new Date()
bot.on('ready', () => {
  var startup_done = new Date() - startup
  console.log(log_time() + log_bot + config.misc.bot_name + ' started up! (' + startup_done + 'ms)')
  console.log(log_time() + log_bot + 'Servers  | ' + bot.guilds.size)
  console.log(log_time() + log_bot + 'Users    | ' + bot.users.size)
  console.log(log_time() + log_bot + 'Channels | ' + bot.channels.size)
  console.log(log_time() + log_bot + 'Started auto saving!')
  db.execute.save_auto.fn(servers, users, blacklist)
  db.execute.status_set_auto.fn(bot)
  db.execute.update_servers.fn(bot)
  db.execute.update_users.fn(bot)
})

//Command Execution
bot.on('message', msg => {
  if (msg.content.startsWith(prefix)) {
    if (msg.channel.type == 'text') {
      if (msg.author.bot == false) {
        if (msg.channel.permissionsFor(bot.user).hasPermission('SEND_MESSAGES')) {
          var base = msg.content.substr(prefix.length)
          var stub = base.split(' ')
          var name = stub[0].toLowerCase()
          var suffix = base.substr(stub[0].length + 1)
          try {
            if (!blacklist[msg.author.id]) {
              if (cmd.execute[name]) {
                if (users[msg.author.id]) {
                  db.execute.checkAchievement.fn(users, msg)
                  if (config.perms.master.indexOf(msg.author.id) > -1) { //Master Commands And everything else for master only so bypassing cooldown
                    cmd.execute[name].fn(bot, msg, suffix)
                    db.execute.command_log.fn(name, msg)
                    users[msg.author.id].stats.commandsUsed += 1
                    cooldown(msg, name)
                  }
                  else if (cmd.execute[name].master == true) { //Master Commands
                    if (config.perms.master.indexOf(msg.author.id) > -1) {
                      cmd.execute[name].fn(bot, msg, suffix)
                      db.execute.command_log.fn(name, msg)
                      users[msg.author.id].stats.commandsUsed += 1
                      cooldown(msg, name)
                    }
                    else {
                      msg.channel.sendMessage('Oh ooh! Something went wrong! Are you sure you are allowed to use this command? You can type `' + prefix + 'commands` to see a full list of all the commands you may use!')
                    }
                  }
                  else if (cmd.execute[name].admin == true) { //Admin Commands
                    if (servers[msg.guild.id].settings.admin.indexOf(msg.author.id) > -1) {
                      cmd.execute[name].fn(bot, msg, suffix)
                      db.execute.command_log.fn(name, msg)
                      users[msg.author.id].stats.commandsUsed += 1
                      cooldown(msg, name)
                    }
                    else {
                      msg.channel.sendMessage('Oh ooh! Something went wrong! Are you sure you are allowed to use this command? You can type `' + prefix + 'commands` to see a full list of all the commands you may use!')
                    }
                  }
                  else { //Default Commands
                    if (user_cooldown[msg.author.id]) {
                      if (user_cooldown[msg.author.id][name]) {
                        if (user_cooldown[msg.author.id][name].cooldown < new Date()) {
                          cmd.execute[name].fn(bot, msg, suffix)
                          db.execute.command_log.fn(name, msg)
                          users[msg.author.id].stats.commandsUsed += 1
                          cooldown(msg, name)
                        } else {
                          var wait = user_cooldown[msg.author.id][name].cooldown - new Date()
                          msg.channel.sendMessage('Oh ooh! You went to fast! Wait another `' + wait + 'ms` to use this command again!')
                        }
                      } else {
                        cooldown(msg, name)
                        cmd.execute[name].fn(bot, msg, suffix)
                        db.execute.command_log.fn(name, msg)
                        users[msg.author.id].stats.commandsUsed += 1
                      }
                    } else {
                      cooldown(msg, name)
                      cmd.execute[name].fn(bot, msg, suffix)
                      db.execute.command_log.fn(name, msg)
                      users[msg.author.id].stats.commandsUsed += 1
                    }
                  }
                } else {
                  msg.channel.sendMessage('Generating user profile... Please try again!')
                  db.execute.user_create_object.fn(msg.author)
                }
              }
            } else {
              //Nothing
            }
          } catch (err) {
            msg.channel.sendMessage('Oh ooh! Something went wrong! My master screwed something up... Please show this to him: `' + err + '`!')
            if (config.misc.debug == true) {
              console.log(log_time() + log_err + 'Command: ' + name + ' Error: ' + err.stack)
            } else {
              console.log(log_time() + log_err + 'Command: ' + name + ' Error: ' + err)
            }
          }
        }
      }
    }
    else {
      msg.channel.sendMessage('I am sorry, but i do not work in private channels!')
    }
  }
})

//Server join
bot.on('guildCreate', (guild) => {
  db.execute.update_servers.fn(bot)
  db.execute.update_users.fn(bot)
  console.log(log_time() + log_bot + 'Joined the server <' + guild.name + '>!')
})

//Server leave
bot.on('guildDelete', (guild) => {
  db.execute.server_remove_object.fn(guild)
  db.execute.update_users.fn(bot)
  console.log(log_time() + log_bot + 'Left the server <' + guild.name + '>!')
})

//User join
bot.on('guildMemberAdd', (guild, member) => {
  db.execute.log.fn(bot, member, guild.id, undefined, undefined, undefined, undefined, undefined, 'user_join')
  db.execute.user_join.fn(guild, member)
  db.execute.update_users.fn(bot)
})

//User leave
bot.on('guildMemberRemove', (guild, member) => {
  db.execute.log.fn(bot, member, guild.id, undefined, undefined, undefined, undefined, undefined, 'user_leave')
  db.execute.user_leave.fn(guild, member)
  db.execute.update_users.fn(bot)
})

//Ban Add
bot.on('guildBanAdd', (guild, user) => {
  db.execute.log.fn(bot, user, guild.id, undefined, undefined, undefined, undefined, undefined, 'user_ban_add')
})

//Ban Remove
bot.on('guildBanRemove', (guild, user) => {
  db.execute.log.fn(bot, user, guild.id, undefined, undefined, undefined, undefined, undefined, 'user_ban_remove')
})

//Channel Create
bot.on('channelCreate', (channel) => {
  if (channel.type == 'text' || channel.tpye == 'voice') {
    db.execute.log.fn(bot, undefined, channel.guild.id, channel, undefined, undefined, undefined, undefined, 'channel_create')
  }
})

//Channel Delete
bot.on('channelDelete', (channel) => {
  db.execute.log.fn(bot, undefined, channel.guild.id, channel, undefined, undefined, undefined, undefined, 'channel_delete')
})

//Role Create
bot.on('guildRoleCreate', (guild, role) => {
  db.execute.log.fn(bot, undefined, guild.id, undefined, role, undefined, undefined, undefined, 'role_create')
})

//Role Delete
bot.on('guildRoleDelete', (guild, role) => {
  db.execute.log.fn(bot, undefined, guild.id, undefined, role, undefined, undefined, undefined, 'role_delete')
})

//Message Delete
bot.on('messageDelete', (msg) => {
  db.execute.log.fn(bot, undefined, msg.guild.id, undefined, undefined, undefined, undefined, msg, 'message_delete')
})

//Message edit
bot.on('messageUpdate', (oldMessage, newMessage) => {
  db.execute.log.fn(bot, undefined, newMessage.guild.id, undefined, undefined, oldMessage, newMessage, undefined, 'message_update')
})

var cooldown = function(msg, cmdn) {
  var date = new Date()
  var new_cooldown = new Date(date.getTime() + cmd.execute[cmdn].cooldown)
  var user_id = msg.author.id
  if (user_cooldown[msg.author.id]) {
    if (user_cooldown[msg.author.id][cmdn]) {
      user_cooldown[msg.author.id][cmdn].cooldown = new_cooldown
    } else {
      user_cooldown[msg.author.id][cmdn] = {'cooldown': new_cooldown}
    }
  } else {
    user_cooldown[msg.author.id] = {[cmdn]: {'cooldown': new_cooldown}}
  }
}

bot.login(config.login.token)
