const Discord = require('discord.js')
const Command = require('cmd')

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
    const inviteEmbed = new Discord.MessageEmbed()
      .setTitle('簡 - 邀請連結')
      .setDescription(
        '[按此把簡加進其他伺服器](https://discord.com/api/oauth2/authorize?client_id=801354940265922608&permissions=8&redirect_uri=https%3A%2F%2Fjanesite.ga%2F&scope=bot%20applications.commands)'
      )
      .setColor(this.client.colors.blue)
    message.reply({embeds: [inviteEmbed]})
  }
}
