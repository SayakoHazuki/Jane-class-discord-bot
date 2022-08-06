import { MongoClient } from 'mongodb'
let mdbclient

async function connectClient () {
  mdbclient = new MongoClient(process.env.MONGO_URI)
  await mdbclient.connect()
}

function getClient () {
  return mdbclient
}

function pos (number) {
  return number < 0 ? 0 : number
}

import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import emojis from '../commands/Hgd/config/emojis.json'
import commands from '../commands/Hgd/config/commands.json'

module.exports = {
  connectClient,
  getClient,
  add,
  npf,
  getData,
  random,
  getLeaderboard,
  getLevel,
  getBar,
  getRank,
  handleRecord,
  getTimeDiff,
  timeInRange,
  checkLevel,
  checkNew,
  spinShard,
  strFormat,
  unlockHighLv,
  generateActionRow
}

async function add (message, action, amount) {
  try {
    logger.info(
      `Adding ${amount} hgd to ${message.author?.tag ||
        message.user?.tag} for ${action}`
    )

    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')

    const query = { snowflake: message.author?.id || message.user?.id }
    const options = {
      sort: { _id: -1 }
    }
    let userdata = await collection.findOne(query, options)
    if (!userdata) {
      await npf(message, action, 0)
      userdata = await collection.findOne(query, options)
    }

    const filter = { snowflake: message.author?.id || message.user?.id }
    const updateDocument = {
      $set: {
        hgd: Number(userdata.hgd) + Number(amount),
        tag: message.author?.tag || message.user?.tag,
        avatarURL:
          message.author?.displayAvatarURL() || message.user?.displayAvatarURL()
      }
    }

    if (updateDocument.$set.hgd >= 45000 && userdata.highLvLocked) {
      updateDocument.$set.hgd = 45000
    }

    const date = new Date()
    updateDocument.$set[`last${action}`] = Math.floor(date.getTime() / 1000)
    const f = s => s.charAt(0).toLowerCase() + s.slice(1)
    updateDocument.$set[`${f(action)}Count`] =
      Number(userdata[`${f(action)}Count`] || 0) + 1
    await collection.updateOne(filter, updateDocument)
    return {
      oldHgd: Number(userdata.hgd),
      newHgd: updateDocument.$set.hgd,
      locked: updateDocument.$set.hgd === 45000 && userdata.highLvLocked
    }
  } catch (e) {
    const erro = new Error(e)
    logger.error(erro)
    message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}

async function npf (message, action, amount) {
  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')

    const newUdata = {
      hgd: amount,
      hi: 0,
      tag: message.author?.tag || message.user?.tag,
      avatarURL:
        message.author?.displayAvatarURL() || message.user?.displayAvatarURL(),
      sCNum: false,
      sID: false,
      sName: false,
      sClass: false,
      lastAfternoonTea: 0,
      lastFile: 0,
      lastPat: 0,
      lastRose: 0,
      lastRoseTea: 0,
      snowflake: message.author?.id || message.user?.id
    }

    const date = new Date()
    newUdata[action] = Math.floor(date.getTime() / 1000)
    await collection.insertOne(newUdata)
    return
  } catch (e) {
    const erro = new Error(e)
    logger.error(erro)
    message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}

async function getData (message) {
  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')
    const query = { snowflake: message.author?.id || message.user?.id }
    const options = {
      sort: { _id: -1 }
    }
    const data = await collection.findOne(query, options)
    logger.info(JSON.stringify(data))
    return data
  } catch (e) {
    const erro = new Error(e)
    logger.error(erro)
    message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}

async function getLeaderboard () {
  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')
    const sort = { hgd: -1 }
    const result = await collection
      .find()
      .sort(sort)
      .toArray()
    const sortedIds = result.map(i => i.snowflake)
    const sortedList = result.map(i =>
      i.snowflake === '726439536401580114'
        ? `**## Lv.無限 ${i.tag} (簡的母親)**\n\t好感度: 無限`
        : `**#${sortedIds.indexOf(i.snowflake)} Lv.${getLevel(i.hgd).value} ${
            i.tag
          }**\n\t好感度: ${i.hgd}`
    )
    return sortedList
  } catch (e) {
    logger.error(e)
  }
}

async function checkNew (message) {
  try {
    const data = await getData(message)
    if (!data) return false
    return true
  } catch (e) {
    logger.error(e)
  }
}

async function getRank (message) {
  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')
    const sort = { hgd: -1 }
    const result = await collection
      .find()
      .sort(sort)
      .toArray()
    const index = result
      .map(i => i.snowflake)
      .indexOf(message.author?.id || message.user?.id)
    return index == null ? '?' : index + 1
  } catch (e) {
    logger.error(e)
  }
}

async function getTimeDiff (message, action, overrideTime, data) {
  if (!data) data = await getData(message)
  const lastAction = data?.[`last${action}`] || 0

  const date = new Date()
  const timeForCompare = overrideTime || Math.floor(date.getTime() / 1000)

  return timeForCompare - lastAction
}

async function checkLevel (message, requirement = -1, data) {
  if (!data) data = await getData(message)
  const level = getLevel(data?.hgd).value || 0
  const levelPass = level >= requirement
  return { levelPass, level, req: requirement }
}

function getLevel (hgd = 0) {
  const levels = require('../commands/Hgd/config/levels.json')
  let finalLevel = 0
  let lowerLimit = 0
  let upperLimit = 0
  let level
  for (let i = 0; i < levels.length; i++) {
    ;({ level, lowerLimit, upperLimit } = levels[i])
    if (hgd >= lowerLimit && hgd < upperLimit) {
      finalLevel = level
      break
    }
  }
  logger.info(`Level : ${finalLevel}, min : ${lowerLimit}, max : ${upperLimit}`)

  const result = {
    min: lowerLimit || 0,
    max: upperLimit || 25,
    percentage:
      ((hgd - pos(lowerLimit)) / (upperLimit - pos(lowerLimit))) * 100,
    value: level || 0
  }
  return result
}

function getBar (hgd) {
  const { percentage } = getLevel(hgd)
  const stage = Math.floor(percentage / 10)
  logger.info(`Stage: ${stage}; Percentage: ${percentage}`)
  const emojis = require('../commands/Hgd/config/emojis.json')

  return `${
    stage <= 0 ? emojis.EMPTY.LEFT : emojis.FILLED.LEFT
  }${emojis.FILLED.MID.repeat(pos(stage - 1))}${emojis.EMPTY.MID.repeat(
    pos(9 - stage)
  )}${stage >= 10 ? emojis.FILLED.RIGHT : emojis.EMPTY.RIGHT}`
}

function handleRecord (timestamp = 0) {
  if (timestamp === 0) return '沒有紀錄'
  return `<t:${timestamp}:R>`
}

function random (min, max) {
  const r = Math.random() * (max - min) + min
  return Math.floor(r)
}

function timeInRange (range) {
  const d = new Date()
  const timeNow = `${n(d.getHours())}:${n(d.getMinutes())}`
  logger.info(`time ${timeNow} in range ${range[0]} - ${range[1]}`)
  if (range[0] > range[1]) {
    logger.info(
      `Above statement is ${(timeNow >= range[0] && timeNow <= '23:59') ||
        (timeNow <= range[1] && timeNow >= '00:00')}`
    )
    return (
      (timeNow >= range[0] && timeNow <= '23:59') ||
      (timeNow <= range[1] && timeNow >= '00:00')
    )
  }
  logger.info(
    `Above statement is ${timeNow >= range[0] && timeNow <= range[1]}`
  )
  return timeNow >= range[0] && timeNow <= range[1]
}

function n (num) {
  return num.toString().padStart(2, '0')
}

async function spinShard (message, luckMultiplier = 1, resMultiplier = 1) {
  const levels = require('../commands/Hgd/config/levels.json')
  const data = await getData(message)
  const level = getLevel(data?.hgd).value || 0
  const shardPossibility = levels[level].shardPerc * 0.01 * luckMultiplier
  const randomNumber = Math.random()
  logger.info(`Shard possibility: ${shardPossibility}, Random: ${randomNumber}`)
  if (randomNumber < shardPossibility) {
    try {
      const database = mdbclient.db('jane')
      const collection = database.collection('hgdv2')

      const query = { snowflake: message.author?.id || message.user?.id }
      const options = {
        sort: { _id: -1 }
      }
      const userdata = await collection.findOne(query, options)

      const filter = { snowflake: message.author?.id || message.user?.id }
      const updateDocument = {
        $set: {
          shards: userdata.shards + 1 * resMultiplier
        }
      }
      await collection.updateOne(filter, updateDocument)
      return 1 * resMultiplier
    } catch (e) {
      const erro = new Error(e)
      logger.error(erro)
      message.reply('很抱歉，簡的資料庫發生了錯誤')
    }
  } else {
    return 0
  }
}

function strFormat (toModify, ...args) {
  let str = toModify.toString()
  if (args.length) {
    const t = typeof args[0]
    let key
    const args_ =
      t === 'string' || t === 'number'
        ? Array.prototype.slice.call(args)
        : args[0]

    for (key in args_) {
      str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), args_[key])
    }
  }

  return str
}

const cap = string => string.charAt(0).toUpperCase() + string.slice(1)

async function generateActionRow (message, userdata) {
  if (!userdata) userdata = await getData(message)
  const buttons = []
  const availableActions = await getAvailableActions(message, userdata)
  for (const { cmd, available } of availableActions) {
    const emoji =
      cmd.code in emojis.actionEmojis ? emojis.actionEmojis[cmd.code] : null
    if (!emoji) continue

    const btn = new MessageButton()
      .setCustomId(`hgd-run:${cmd.code}`)
      .setDisabled(!available)
      .setEmoji(emoji.replace(/(.*:)|[<>]/g, ''))
      .setStyle('SECONDARY')
    buttons.push(btn)
  }
  const row = new MessageActionRow().addComponents(buttons.slice(0, 5))
  return row
}

async function getAvailableActions (message, userdata) {
  const availableCommands = []
  for (const cmd of commands) {
    let diffPass = true
    let levelPass = true
    let dayOfWeekPass = true
    let timeIsInRange = true

    const { diffRequirement, lvRequirement, timeRange, dayRange } = cmd.config
    if (diffRequirement) {
      const diff = await getTimeDiff(message, cap(cmd.code), null, userdata)
      const diffValidate = timeDiff => timeDiff > diffRequirement * 60
      diffPass = diffValidate(diff)
    }
    if (lvRequirement) {
      ;({ levelPass } = await checkLevel(message, lvRequirement, userdata))
    }
    if (dayRange) {
      const dayOfWeek = new Date().getDay()
      dayOfWeekPass = dayRange.includes(dayOfWeek)
    }
    if (timeRange) {
      timeIsInRange = timeInRange(timeRange)
    }

    if (diffPass && levelPass && dayOfWeekPass && timeIsInRange) {
      availableCommands.push({ cmd, available: true })
      continue
    }
    if (levelPass) {
      availableCommands.push({ cmd, available: false })
      continue
    }
  }
  availableCommands.sort((a, b) => {
    return a.available === b.available ? 0 : a.available ? -1 : 1
  })
  return availableCommands
}

async function unlockHighLv (interaction) {
  const { user } = interaction

  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')

    const query = { snowflake: user.id }
    const options = {
      sort: { _id: -1 }
    }
    const userdata = await collection.findOne(query, options)

    const filter = { snowflake: user.id }
    const updateDocument = {
      $set: {
        shards: Number(userdata.shards) - 25,
        highLvLocked: false
      }
    }

    if (updateDocument.$set.shards < 0) return

    await collection.updateOne(filter, updateDocument)

    const level = getLevel(userdata.hgd).value
    await interaction.message.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `Lv.${level} | ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setTitle('已解放好感度等級上限')
          .setDescription(
            `等級上限: Lv.30 \u279f Lv.40 \n好感度解放碎片持有數: ${userdata.shards} \u279f ${updateDocument.$set.shards}`
          )
          .setColor('#FB9EFF')
      ]
    })
  } catch (e) {
    const erro = new Error(e)
    logger.error(erro)
    interaction.message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}