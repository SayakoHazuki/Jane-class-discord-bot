const Discord = require('discord.js')
const Command = require('cmd')
const hgdUtil = require('hgdUtils')
const Util = require('utils')

module.exports = class HgdCommand extends Command {
  constructor (client) {
    super(client, {
      name: '好感度',
      aliases: ['hgd'],
      category: '好感度',
      description: '查看好感度資訊',
      usage: 'hgd',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const emojis = require('./config/emojis.json')
    const commands = require('./config/commands.json')
    const messages = require('./config/messages.json')
    try {
      const data = (await hgdUtil.getData(message)) || {}
      const actionRecords = {
        rose: data.lastRose || 0,
        files: data.lastFiles || 0,
        roseTea: data.lastRoseTea || 0,
        pat: data.lastPat || 0,
        teeTee: data.lastTeeTee || 0,
        afternoonTea: data.lastAfternoonTea || 0,
        gardening: data.lastGardening || 0,
        morning: data.lastMorning || 0,
        night: data.lastNight || 0
      }
      if (!data.hgd) data.hgd = 0
      // min, max, percentage, number
      const level = hgdUtil.getLevel(data.hgd)
      const rank = await hgdUtil.getRank(message)

      const handledRecords = {}
      for (const action in actionRecords) {
        handledRecords[action] = hgdUtil.handleRecord(actionRecords[action])
      }

      function getOkaasanBar () {
        return `${emojis.FILLED.LEFT}${emojis.FILLED.MID.repeat(8)}${
          emojis.FILLED.RIGHT
        }`
      }

      function diffPass (time, req) {
        const epochNow = Math.floor(new Date().getTime() / 1000)
        const diff = epochNow - time
        return diff >= req * 60
      }

      function getActionInfo (action) {
        const command = commands.filter(({ code }) => code === action)[0]
        if (!command) {
          return Util.printLog(
            'ERR',
            __filename,
            `Can't find command with code ${action}`
          )
        }
        return level.value >= command.config.lvRequirement
          ? `${
              diffPass(actionRecords[action], command.config.diffRequirement)
                ? emojis.check.full
                : emojis.blank.full
            } | ${emojis.actionEmojis[action]} 上次${messages[action]
              ?.altActionTitle || ''}: ${handledRecords[action]}\n`
          : ''
      }

      let actionInfo = ''
      for (const action in actionRecords) {
        actionInfo += getActionInfo(action)
      }
      Util.printLog('INFO', __filename, actionInfo)

      const actionRow = await hgdUtil.generateActionRow(message, data)

      const okaasanEmbed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTitle('好感度')
        .setDescription(
          `**等級 MAX** (-/MAX) • *排名: 母親*\u2800\n${getOkaasanBar()}\n${actionInfo}好感度解放碎片: ∞`
        )
        .setColor('#ff64ab')
        .setFooter('簡')

      const hgdEmbed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTitle('好感度')
        .setDescription(
          `**等級 ${level.value}${
            data.highLvLocked && data.hgd >= 45000 ? ' 🔒' : ''
          }** (${data.hgd}/${level.max}) • *排名: ${
            rank ? rank - 1 || '?' : '?'
          }*\u2800\n${hgdUtil.getBar(data.hgd)}  *${
            Math.floor(level.percentage)
          }%*\n\n${actionInfo}\n好感度解放碎片: ${data.shards || 0}`
        )
        .setColor('#ff64ab')
        .setFooter(
          `Tip: ${messages.tips[hgdUtil.random(0, messages.tips.length)]} - 簡`
        )
      if (message.author.id === '726439536401580114') {
        return message.reply({ embeds: [okaasanEmbed] })
      }
      message.reply({ embeds: [hgdEmbed], components: [actionRow] })
    } catch (e) {
      Util.printLog('ERR', __filename, e)
    }
  }
}
