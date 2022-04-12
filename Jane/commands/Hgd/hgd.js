const Discord = require('discord.js')
const Command = require('cmd')
const hgdUtil = require('hgdUtils')
const Util = require('utils')

const emojis = require('./config/emojis.json')
const commands = require('./config/commands.json')
const messages = require('./config/messages.json')

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

function getActionInfo ({ level, actionRecords, handledRecords, action }) {
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

      let actionInfo = ''
      for (const action in actionRecords) {
        actionInfo += getActionInfo({
          level,
          actionRecords,
          handledRecords,
          action
        })
      }

      const showMoreBtn = new Discord.MessageButton()
        .setCustomId('hgd:show-more')
        .setStyle('PRIMARY')
        .setLabel('顯示更多詳細資料...')
      const buttonRow = new Discord.MessageActionRow().addComponents(
        showMoreBtn
      )

      const actionRow = await hgdUtil.generateActionRow(message, data)

      const getOkaasanString = () =>
        `**等級 MAX** (-/MAX) • *排名: 母親*\u2800\n${getOkaasanBar()}\n${actionInfo}好感度解放碎片: ∞`
      const hgdEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL()
        })
        .setTitle('好感度')
        .setDescription(
          message.author.id === '726439536401580114'
            ? getOkaasanString()
            : `**等級 ${level.value}${
                data.highLvLocked && data.hgd >= 45000 ? ' 🔒' : ''
              }** (${data.hgd}/${level.max}) • *排名: ${
                rank ? rank - 1 || '?' : '?'
              }*\u2800\n${hgdUtil.getBar(data.hgd)}  *${Math.floor(
                level.percentage
              )}%*\n\n${actionInfo}\n好感度解放碎片: ${data.shards || 0}`
        )
        .setColor('#ff64ab')
        .setFooter({
          text: `Tip: ${
            messages.tips[hgdUtil.random(0, messages.tips.length)]
          } - 簡`
        })
      message
        .reply({
          embeds: [hgdEmbed],
          components: [buttonRow, actionRow]
        })
        .catch(e => Util.printLog('ERR', __filename, e.stack))
    } catch (e) {
      Util.printLog('ERR', __filename, e)
    }
  }

  /**
   * follow up function for button interaction
   * @param {Discord.ButtonInteraction} interaction
   */
  async followUp (interaction) {
    switch (interaction.customId) {
      case 'hgd:show-more':
        showMore(interaction)
        break
    }

    async function showMore (interaction) {
      const data = (await hgdUtil.getData(interaction)) || {}
      data.hgd ||= 0

      const actions = commands.map(cmd => cmd.code)
      const actionRecords = {}
      const actionCounts = {}

      for (const code of actions) {
        const c = s => s.charAt(0).toUpperCase() + s.slice(1)
        actionRecords[code] = data[`last${c(code)}`] || 0
        actionCounts[code] = data[`${code}Count`] || 0
      }

      // min, max, percentage, number
      const level = hgdUtil.getLevel(data.hgd)
      const rank = await hgdUtil.getRank(interaction)

      const handledRecords = {}
      for (const action in actionRecords) {
        handledRecords[action] = hgdUtil.handleRecord(actionRecords[action])
      }

      let actionInfo = ''
      let actionCount = ''
      for (const action in actionRecords) {
        actionInfo += getActionInfo({
          level,
          actionRecords,
          handledRecords,
          action
        })
      }
      for (const action in actionCounts) {
        const command = commands.filter(({ code }) => code === action)[0]
        if (!command) return
        actionCount += `共${messages[action].altActionTitle} ${actionCounts[action]}次\n`
      }

      const getOkaasanString = () =>
        `**等級 MAX** (-/MAX) • *排名: 母親*\u2800\n${getOkaasanBar()}\n${actionInfo}好感度解放碎片: ∞`
      const hgdEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTitle('好感度')
        .setDescription(
          interaction.user.id === '726439536401580114'
            ? getOkaasanString()
            : `**等級 ${level.value}${
                data.highLvLocked && data.hgd >= 45000 ? ' 🔒' : ''
              }** (${data.hgd}/${level.max}) • *排名: ${
                rank ? rank - 1 || '?' : '?'
              }*\u2800\n${hgdUtil.getBar(data.hgd)}  *${Math.floor(
                level.percentage
              )}%*\n\n${actionInfo}\n好感度解放碎片: ${data.shards || 0}`
        )
        .addField('指令使用紀錄', actionCount)
        .setColor('#ff64ab')
        .setFooter({
          text: `Tip: ${
            messages.tips[hgdUtil.random(0, messages.tips.length)]
          } - 簡`
        })

      const actionRow = await hgdUtil.generateActionRow(interaction, data)
      return interaction.message
        .edit({ embeds: [hgdEmbed], components: [actionRow] })
        .then(interaction.deferUpdate())
        .catch(e => {
          Util.printLog('ERR', __filename, e.stack)
        })
    }
  }
}
