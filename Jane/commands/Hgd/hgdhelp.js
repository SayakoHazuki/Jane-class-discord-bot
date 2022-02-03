const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')

const dayOfWeekList = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

const config = require('./hgdConfig.json')

function getClockEmoji (mins) {
  if (mins >= 60) {
    return `:clock${Math.round(mins / 60) % 12}:`
  }
  return `:clock${Math.round((mins / 60) * 12)}:`
}

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
    const actionsList = Object.entries(config.settings).map(([a, b]) => a)
    Util.printLog('INFO', __filename, actionsList)
    for (const action of actionsList) {
      if (!(action in config.settings)) continue
      if (!(action in config.messages)) continue
      commandList += `**${config.messages[action].command}**\n${
        config.settings[action].diffRequirement >= 1
          ? ` ${getClockEmoji(
              config.settings[action].diffRequirement
            )} 冷卻時間: ${
              config.settings[action].diffRequirement >= 60
                ? `${config.settings[action].diffRequirement / 60} 小時`
                : `${config.settings[action].diffRequirement} 分鐘`
            }\n`
          : ''
      }${
        config.settings[action].lvRequirement >= 1
          ? ` :information_source: 等級要求: ${config.settings[action].lvRequirement}\n`
          : ''
      }${
        'dayRange' in config.settings[action] ||
        'timeRange' in config.settings[action]
          ? ` :calendar_spiral:時段限制: ${
              !('dayRange' in config.settings[action])
                ? ''
                : config.settings[action].dayRange
                    .map(i => dayOfWeekList[i])
                    .join('/')
            } ${
              !('timeRange' in config.settings[action])
                ? ''
                : config.settings[action].timeRange.join(' - ')
            } \n`
          : ''
      }\n`
    }
    const helpEmbed = new Discord.MessageEmbed()
      .setAuthor('好感度系統', config.emojis.jane_love.url)
      .setTitle('簡介')
      .setDescription(
        '簡的好感度系統在2021年1月22日上線了!\n可以透過不同的互動增加好感度! <:JANE_LightStickR:936956856604180480>\n越高好感度, 互動的方式就越多喔!\n快到 <#802180277534982224> 提升好感度吧!'
      )
      .addField('☆;+;｡･ﾟ･｡;+;☆ 互動指令 ☆;+;｡･ﾟ･｡;+;☆', commandList)
      .setFooter(
        `Tip: ${
          config.messages.tips[hgd.random(0, config.messages.tips.length)]
        } - 簡`
      )
      .setColor(this.client.colors.green)
    message.reply({ embeds: [helpEmbed] })
  }
}
