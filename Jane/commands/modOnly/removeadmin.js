const Command = require('cmd')

module.exports = class RemoveAdminCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'removeAdmin',
      aliases: ['removeAdmin', 'delAdmin',
        'delAdm', 'noAdmin'],
      category: 737012021,
      description: "remove someone's admin",
      usage: 'removeAdmin <code>',
      minArgs: 1,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (message.author.id !== '690822196972486656' && message.author.id !== '726439536401580114' && message.author.id !== '794181749432778753') {
      return
    }
    const ch = message.channel; const g = message.guild
    const role = g.roles.cache.get('800512406740271174')

    const u = message.mentions.members ? message.mentions.members.first() : message.guild.users.cache.find(user => user.username.startsWith(args[0]))
    if (u == null) {
      return ch.send('簡 不知道要移除誰的管理員權限。 請@需要移除管理員權限的用戶')
    }
    try {
      if (u.id === '799271109883068446') {
        return ch.send('簡 不希望移除自己的權限 .-.')
      }
      g.member(u).roles.remove(role)
      ch.send(`簡已經移除了 <@!${u.id}>的管理員權限`)
    } catch (e) {
      ch.send('簡 發現了一個錯誤 ')
    }
  }
}
