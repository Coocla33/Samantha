const servers = require('./servers.json')

var log = {
  user_join: {
    fn: function(bot, user, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `USER JOIN` | `' + user.user.username + '#' + user.user.discriminator + ' - ' + user.user.id +  '`')
    }
  },
  user_leave: {
    fn: function(bot, user, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `USER LEAVE` | `' + user.user.username + '#' + user.user.discriminator + ' - ' + user.user.id +  '`')
    }
  },
  user_ban_add: {
    fn: function(bot, user, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `BANNED` | `' + user.username + '#' + user.discriminator + ' - ' + user.id +  '`')
    }
  },
  user_ban_remove: {
    fn: function(bot, user, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `UNBANNED` | `' + user.username + '#' + user.discriminator + ' - ' + user.id + '`')
    }
  },
  channel_create: {
    fn: function(bot, channel, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `CHANNEL CREATED` | `' + channel.name + ' - ' + channel.id + ' - ' + channel.type + '`')
    }
  },
  channel_delete: {
    fn: function(bot, channel, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `CHANNEL DELETED` | `' + channel.name + ' - ' + channel.id + ' - ' + channel.type + '`')
    }
  },
  role_create: {
    fn: function(bot, role, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `ROLE CREATED` | `' + role.name + ' - ' + role.id + '`')
    }
  },
  role_delete: {
    fn: function(bot, role, logChannel) {
      bot.channels.get(logChannel).sendMessage('`LOG` | `ROLE DELETED` | `' + role.name + ' - ' + role.id + '`')
    }
  }
}

exports.execute = log
