const Discord = require('discord.js')
const Command = require('cmd')
const hgdUtil = require('hgdUtils')
const Util = require('utils')

const config = require('./hgdConfig.json')

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
    try {
      const data = (await hgdUtil.getData(message)) || {}
      const actionRecords = {
        rose: data.lastRose || 0,
        files: data.lastFiles || 0,
        roseTea: data.lastRoseTea || 0,
        pat: data.lastPat || 0,
        teeTee: data.lastTeeTee || 0,
        afternoonTea: data.lastAfternoonTea || 0,
        gardening: data.lastGardening || 0
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
        const emojis = config.emojis
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
        return level.value >= config.settings[action].lvRequirement
          ? `${
              diffPass(
                actionRecords[action],
                config.settings[action].diffRequirement
              )
                ? config.emojis.check.full
                : config.emojis.blank.full
            } | ${config.emojis.actionEmojis[action]} 上次${config.messages[
              action
            ]?.altActionTitle || ''}: ${handledRecords[action]}\n`
          : ''
      }

      let actionInfo = ''
      for (const action in actionRecords) {
        actionInfo += getActionInfo(action)
      }
      Util.printLog('INFO', __filename, actionInfo)

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
          }*\u2800\n${hgdUtil.getBar(
            data.hgd
          )}\n${actionInfo}\n好感度解放碎片: ${data.shards || 0}`
        )
        .setColor('#ff64ab')
        .setFooter(
          `Tip: ${
            config.messages.tips[hgdUtil.random(0, config.messages.tips.length)]
          } - 簡`
        )
      if (message.author.id === '726439536401580114') {
        return message.reply({ embeds: [okaasanEmbed] })
      }
      message.reply({ embeds: [hgdEmbed] })
    } catch (e) {
      Util.printLog('ERR', __filename, e)
    }
  }
}
