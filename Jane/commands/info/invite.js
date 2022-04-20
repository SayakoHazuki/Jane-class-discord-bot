const Discord = require('discord.js')
const Command = require('../../core/command')

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      aliases: ['inv', 'add'],
      category: '一般',
      description: '把簡加進其他伺服器',
      usage: 'invite',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const linkButtons = new Discord.MessageActionRow().addComponents([
      new Discord.MessageButton()
        .setStyle('LINK')
        .setLabel('把簡加進其他伺服器')
        .setURL(
          'https://discord.com/api/oauth2/authorize?client_id=801354940265922608&permissions=8&scope=bot'
        )
    ])
    message.reply({ components: [linkButtons] })
  }
}
