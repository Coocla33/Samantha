const servers = require('./servers.json')
const db = require('./database.js')

var log = {
  user_join: {
    fn: function(bot, user, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `User Join` - Name: `' + user.user.username + '#' + user.user.discriminator + '` Id: `' + user.user.id + '`')
    }
  },
  user_leave: {
    fn: function(bot, user, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `User Leave` - Name: `' + user.user.username + '#' + user.user.discriminator + '` Id: `' + user.user.id + '`')
    }
  },
  user_ban_add: {
    fn: function(bot, user, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `User Ban` - Name: `' + user.user.username + '#' + user.user.discriminator + '` Id: `' + user.user.id + '`')
    }
  },
  user_ban_remove: {
    fn: function(bot, user, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `User Unban` - Name: `' + user.user.username + '#' + user.user.discriminator + '` Id: `' + user.user.id + '`')
    }
  },
  channel_create: {
    fn: function(bot, channel, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `Channel Create` - Name: `' + channel.name + '` Id: `' + channel.id + '` Type: `' + channel.type + '`')
    }
  },
  channel_delete: {
    fn: function(bot, channel, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `Channel Delete` - Name: `' + channel.name + '` Id: `' + channel.id + '` Type: `' + channel.type + '`')
    }
  },
  role_create: {
    fn: function(bot, role, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `Role Create` - Name: `' + role.name + '` Id: `' + role.id + '`')
    }
  },
  role_delete: {
    fn: function(bot, role, logChannel) {
      var time = db.execute.get_time.fn(new Date())
      bot.channels.get(logChannel).sendMessage('`' + time + '` - `Role Delete` - Name: `' + role.name + '` Id: `' + role.id + '`')
    }
  },
  message_delete: {
    fn: function(bot, msg, logChannel) {
      if (msg.author.bot == true) {
        //Nothing
      }
      else {
        var time = db.execute.get_time.fn(new Date())
        bot.channels.get(logChannel).sendMessage('`' + time + '` - `Message Delete` - Message: `' + msg.content + '` Author: `' + msg.author.username + '`')
      }
    }
  },
  message_update: {
    fn: function(bot, oldMessage, newMessage, logChannel) {
      if (msg.author.id == true) {
        //Nothing
      }
      else {
        var time = db.execute.get_time.fn(new Date())
        bot.channels.get(logChannel).sendMessage('`' + time + '` - `Message Update` - Old Message: `' + oldMessage.content + '` New Message: `' + newMessage.content + '`')
      }
    }
  }
}

exports.execute = log
