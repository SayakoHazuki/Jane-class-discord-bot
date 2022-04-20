const Discord = require('discord.js')
const Command = require('../../core/command')

module.exports = class LinksCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'links',
      aliases: ['link', 'l'],
      category: '資訊',
      description: '顯示常用連結列表',
      usage: 'link',
      minArgs: 0,
      maxArgs: 0
    })
  }

  async run (message, args) {
    const linkButtons = new Discord.MessageActionRow().addComponents([
      new Discord.MessageButton()
        .setStyle('LINK')
        .setLabel('常用連結列表')
        .setURL('https://jane.ml/links')
    ])
    message.reply({ components: [linkButtons] })
  }
}
