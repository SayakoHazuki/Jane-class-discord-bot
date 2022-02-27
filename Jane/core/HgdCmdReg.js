const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')

const cap = string => string.charAt(0).toUpperCase() + string.slice(1)

class HgdCommand extends Command {
  constructor (client, command) {
    const { code, props } = command
    const { name, aliases } = props
    const messages = require('../commands/Hgd/config/messages.json')

    super(client, {
      name,
      aliases,
      category: '好感度',
      description: name,
      usage: name,
      minArgs: 0,
      maxArgs: -1
    })

    this.code = code
    this.config = command.config
    this.messages = messages[code]
  }

  async run (message, args) {
    let diffPass = true

    const { code, config, messages } = this
    const { diffRequirement, lvRequirement, timeRange, dayRange } = config

    let userlevel

    if (diffRequirement) {
      const diff = await hgd.getTimeDiff(message, cap(code))
      const diffValidate = timeDiff => timeDiff > diffRequirement * 60
      diffPass = diffValidate(diff)

      Util.printLog(
        'INFO',
        __filename,
        `time difference: ${diff} seconds; Pass: ${diffPass}`
      )
    }

    if (lvRequirement) {
      const { level, levelPass, req } = await hgd.checkLevel(
        message,
        lvRequirement
      )
      userlevel = level
      if (!levelPass) {
        const lvNotPassEmbed = new Discord.MessageEmbed()
          .setColor('#FB9EFF')
          .setAuthor(
            `Lv.${level} | ${message.author.tag}`,
            message.author.displayAvatarURL()
          )
          .setDescription(`您未達到可以進行該動作的等級 (${level}/${req})`)
          .setTimestamp()
          .setFooter('簡')
        return message.reply({ embeds: [lvNotPassEmbed] })
      }
    }

    if (dayRange) {
      const dayOfWeek = new Date().getDay()
      const dayOfWeekPass = dayRange.includes(dayOfWeek)
      if (!dayOfWeekPass) {
        const dayOfWeekFailEmbed = new Discord.MessageEmbed()
          .setColor('#FB9EFF')
          .setAuthor(
            `Lv.${userlevel} | ${message.author.tag}`,
            message.author.displayAvatarURL()
          )
          .setDescription(
            `${messages.notInDayRange} ${config.emojis.jane_love.full}`
          )
          .setTimestamp()
          .setFooter('簡')
        return message.reply({ embeds: [dayOfWeekFailEmbed] })
      }
    }

    if (timeRange) {
      if (!hgd.timeInRange(timeRange)) {
        const timeNotInRangeEmbed = new Discord.MessageEmbed()
          .setColor('#FB9EFF')
          .setAuthor(
            `Lv.${userlevel} | ${message.author.tag}`,
            message.author.displayAvatarURL()
          )
          .setDescription(
            `${messages.notInTimeRange} (${timeRange[0]}~${timeRange[1]})`
          )
          .setTimestamp()
          .setFooter('簡')
        return message.reply({ embeds: [timeNotInRangeEmbed] })
      }
    }

    const { min, max, minFail, maxFail } = config.hgd
    const amount = diffPass
      ? hgd.random(min, max)
      : hgd.random(minFail, maxFail)
    const { oldHgd, newHgd, locked } = await hgd.add(message, cap(code), amount)

    if (diffPass) {
      const texts = Util.randomFromArray(messages.pass)
      Util.printLog('INFO', __filename, JSON.stringify(texts))
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${hgd.strFormat(messages.actionTitle, {
            displayName: message.member.displayName
          })}`
        )
        .setAuthor(
          `Lv.${userlevel} | ${message.author.tag}`,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${hgd.strFormat(texts.message, {
            displayName: message.member.displayName
          })}\n好感度+${newHgd - oldHgd} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})`.replace(/9000[0-9]{5}/g, '∞')
        )
        .setTimestamp()
        .setFooter(
          `${hgd.strFormat(texts.footer, {
            displayName: message.member.displayName
          })}`
        )
      message.reply({ embeds: [replyEmbed] })
      await hgd.spinShard(message)
    } else {
      const texts = Util.randomFromArray(messages.fail)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${hgd.strFormat(messages.actionTitle, {
            displayName: message.member.displayName
          })}`
        )
        .setAuthor(
          `Lv.${userlevel} | ${message.author.tag}`,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${hgd.strFormat(texts.message, {
            displayName: message.member.displayName
          })}\n好感度${amount} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})`.replace(/9000[0-9]{5}/g, '∞')
        )
        .setTimestamp()
        .setFooter(
          `${hgd.strFormat(texts.footer, {
            displayName: message.member.displayName
          })}`
        )
      message.reply({ embeds: [replyEmbed] })
    }
  }
}

module.exports = function registerHgdCommands (client) {
  const clientCommands = []
  const hgdCommands = require('../commands/Hgd/config/commands.json')
  for (const hgdCommand of hgdCommands) {
    const command = new HgdCommand(client, hgdCommand)
    clientCommands.push(command)
  }
  return clientCommands
}
