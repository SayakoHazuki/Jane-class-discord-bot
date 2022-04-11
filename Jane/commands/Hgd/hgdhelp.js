const Discord = require('discord.js')
const Command = require('cmd')

const hgd = require('hgdUtils')

const dayOfWeekList = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

module.exports = class HgdHelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hgdHelp',
      aliases: ['hgd?', 'hgdmenu'],
      category: '好感度',
      description: '查看好感度介紹',
      usage: 'hgdHelp',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    let commandList = ''
    const actionsList = require('./config/commands.json')

    for (const action of actionsList) {
      const command = action.props.name
      const {
        diffRequirement,
        lvRequirement,
        timeRange,
        dayRange
      } = action.config

      commandList += `**${command}**\n${
        diffRequirement >= 1
          ? ` ⏳ 冷卻時間: ${
              diffRequirement >= 60
                ? `${diffRequirement / 60} 小時`
                : `${diffRequirement} 分鐘`
            }\n`
          : ''
      }${lvRequirement >= 1 ? ` 🔒 等級要求: ${lvRequirement}\n` : ''}${
        timeRange || dayRange
          ? ` 🕒 時段限制: ${
              dayRange ? dayRange.map(i => dayOfWeekList[i]).join('/') : ''
            } ${timeRange ? timeRange.join(' - ') : ''} \n`
          : ''
      }\n`
    }

    const emojis = require('./config/emojis.json')
    const messages = require('./config/messages.json')
    const helpEmbed = new Discord.MessageEmbed()
      .setAuthor({ name: '好感度系統', iconURL: emojis.jane_love.url })
      .setTitle('簡介')
      .setDescription(
        '簡的好感度系統在2021年1月22日上線了!\n可以透過不同的互動增加好感度! <:JANE_LightStickR:936956856604180480>\n越高好感度, 互動的方式就越多喔!\n快到 <#802180277534982224> 提升好感度吧!'
      )
      .addField('☆;+;｡･ﾟ･｡;+;☆ 互動指令 ☆;+;｡･ﾟ･｡;+;☆', commandList)
      .setFooter(
        `Tip: ${messages.tips[hgd.random(0, messages.tips.length)]} - 簡`
      )
      .setColor(this.client.colors.green)
    message.reply({ embeds: [helpEmbed] })
  }
}
