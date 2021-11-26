const Command = require('cmd')
const { MessageEmbed } = require('discord.js')

module.exports = class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['h'],
      category: '一般',
      description: '查看指令列表',
      usage: 'help [command]'
    })
  }

  async run (message, args) {
    if (args.length) {
      const command =
        this.client.commands.get(args[0]) ??
        this.client.commands.find(
          command => command.aliases && command.aliases.includes(args[0])
        )

      if (!command) return message.reply('❌ 找不到指令')

      const embed = new MessageEmbed()
        .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
        .setTitle(command.name)
        .setDescription(command.description)
        .addField(
          '也可以使用',
          `\`${command.aliases.join('`, `') || 'None'}\``,
          true
        )
        .addField('類別', command.category, true)
        .addField('用法', `${this.client.prefix}${command.usage}`, true)
        .setColor(message.guild.me.displayHexColor)
      message.reply({embeds: [embed]})
    } else {
      const commands = this.client.commands

      const embed = new MessageEmbed()
        .setTitle('幫助介面')
        .setDescription('如果想搜尋某一個指令的用法, 請使用 `-help [指令]`')
        .setColor(message.guild.me.displayHexColor)

      const obj = {}
      let cat
      let cmds

      commands.forEach(command => {
        const category = command.category || 'Unknown'
        const name = command.name

        if (!obj[category]) {
          obj[category] = []
        }

        obj[category].push(name)
      })

      for ([cat, cmds] of Object.entries(obj)) {
        if (cat === '737012021' || cat === '(Unfinished commands)') continue
        embed.addField(`${cat}`, `\`${cmds.sort().join('`, `')}\``)
      }
      message.reply({embeds: [embed]})
    }
  }
}
