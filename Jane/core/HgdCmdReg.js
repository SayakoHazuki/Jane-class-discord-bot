const Discord = require('discord.js')
const Command = require('./command.js')
const Util = require('../Utils/index.js')
const hgd = require('../Utils/hgdUtils.js')
const logger = new (require('../Utils/terminal'))(__filename)

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

      logger.info(`time difference: ${diff} seconds; Pass: ${diffPass}`)
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
          .setAuthor({
            name: `Lv.${level} | ${message.author?.tag || message.user?.tag}`,
            iconURL:
              message.author?.displayAvatarURL() ||
              message.user?.displayAvatarURL()
          })
          .setDescription(`您未達到可以進行該動作的等級 (${level}/${req})`)
          .setTimestamp()
          .setFooter('簡')
        return message
          .reply({ embeds: [lvNotPassEmbed] })
          .catch(e => logger.error(e.stack))
      }
    }

    if (dayRange) {
      const dayOfWeek = new Date().getDay()
      const dayOfWeekPass = dayRange.includes(dayOfWeek)
      if (!dayOfWeekPass) {
        const dayOfWeekFailEmbed = new Discord.MessageEmbed()
          .setColor('#FB9EFF')
          .setAuthor({
            name: `Lv.${userlevel} | ${message.author?.tag ||
              message.user?.tag}`,
            iconURL:
              message.author?.displayAvatarURL() ||
              message.user?.displayAvatarURL()
          })
          .setDescription(
            `${hgd.strFormat(
              Util.randomFromArray(messages.dayNotInRange).message || '',
              { displayName: message.member.displayName }
            )}`
          )
          .setTimestamp()
          .setFooter('簡')
        return message
          .reply({ embeds: [dayOfWeekFailEmbed] })
          .catch(e => logger.error(e.stack))
      }
    }

    if (timeRange) {
      if (!hgd.timeInRange(timeRange)) {
        const timeNotInRangeEmbed = new Discord.MessageEmbed()
          .setColor('#FB9EFF')
          .setAuthor({
            name: `Lv.${userlevel} | ${message.author?.tag ||
              message.user?.tag}`,
            iconURL:
              message.author?.displayAvatarURL() ||
              message.user?.displayAvatarURL()
          })
          .setDescription(
            `${hgd.strFormat(
              Util.randomFromArray(messages.timeNotInRange).message || '',
              { displayName: message.member.displayName }
            )}`
          )
          .setTimestamp()
          .setFooter('簡')
        return message
          .reply({ embeds: [timeNotInRangeEmbed] })
          .catch(e => logger.error(e.stack))
      }
    }

    const { min, max, minFail, maxFail } = config.hgd
    const amount = diffPass
      ? hgd.random(min, max)
      : hgd.random(minFail, maxFail)
    const { oldHgd, newHgd, locked } = await hgd.add(message, cap(code), amount)

    if (diffPass) {
      const texts = Util.randomFromArray(messages.pass)
      logger.info(JSON.stringify(texts))
      const shardsNum = await hgd.spinShard(message)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${hgd.strFormat(messages.actionTitle, {
            displayName: message.member.displayName
          })}`
        )
        .setAuthor({
          name: `Lv.${userlevel} | ${message.author?.tag || message.user?.tag}`,
          iconURL:
            message.author?.displayAvatarURL() ||
            message.user?.displayAvatarURL()
        })
        .setDescription(
          `${hgd.strFormat(texts.message, {
            displayName: message.member.displayName
          })}\n好感度+${newHgd - oldHgd} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})${
            shardsNum ? '\n好感度解放碎片+' + shardsNum : ''
          }`.replace(/9000[0-9]{5}/g, '∞')
        )
        .setTimestamp()
        .setFooter(
          `${hgd.strFormat(texts.footer, {
            displayName: message.member.displayName
          })}`
        )
      const actionRow = await hgd.generateActionRow(message)
      message
        .reply({ embeds: [replyEmbed], components: [actionRow] })
        .catch(e => logger.error(e.stack))
    } else {
      const texts = Util.randomFromArray(messages.fail)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${hgd.strFormat(messages.actionTitle, {
            displayName: message.member.displayName
          })}`
        )
        .setAuthor({
          name: `Lv.${userlevel} | ${message.author?.tag || message.user?.tag}`,
          iconURL:
            message.author?.displayAvatarURL() ||
            message.user?.displayAvatarURL()
        })
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
      const actionRow = await hgd.generateActionRow(message)
      message
        .reply({ embeds: [replyEmbed], components: [actionRow] })
        .catch(e => logger.error(e.stack))
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
