const Command = require('cmd')

module.exports = class DMSayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dmsay',
      category: 737012021,
      description: 'ModsOnly',
      usage: 'dmsay <member> <message>',
      minArgs: 2,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (message.author.id !== '690822196972486656' && message.author.id !== '726439536401580114' && message.author.id !== '794181749432778753') {
      return
    }

    const userToSend = /^[0-9]{17,18}$/.test(args[0]) ? message.users.cache.get(args[0]) : this.client.users.cache.find(user => user.username.startsWith(`${args[0]}`))
    if (!userToSend) return message.inlineReply('找不到用戶')
    const msgtosend = message.content.replace(`-dmsay ${args[0]} `, '')
    const confmsg = await message.inlineReply(`輸入ok以確定(no以取消) 向${userToSend.tag}發送:\n${msgtosend}\n\n`)
    confmsg.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 120000, errors: ['time'] }).then(collected => {
      if (collected.first().content === 'ok') {
        userToSend.send(msgtosend)
      } else collected.first().inlineReply('已跳過')
    }).catch()
  }
}
