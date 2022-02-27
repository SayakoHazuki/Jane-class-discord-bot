const { MongoClient } = require('mongodb')
let mdbclient

const terminal = require('./terminal')

async function connectClient () {
  mdbclient = new MongoClient(process.env.MONGO_URI)
  await mdbclient.connect()
}

function getClient () {
  return mdbclient
}

function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}
function pos (number) {
  return number < 0 ? 0 : number
}

const { MessageEmbed } = require('discord.js')

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
  unlockHighLv
}

async function add (message, action, amount) {
  try {
    printLog(
      'INFO',
      __filename,
      `Adding ${amount} hgd to ${message.author.tag} for ${action}`
    )

    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')

    const query = { snowflake: message.author.id }
    const options = {
      sort: { _id: -1 }
    }
    let userdata = await collection.findOne(query, options)
    if (!userdata) {
      await npf(message, action, 0)
      userdata = await collection.findOne(query, options)
    }

    const filter = { snowflake: message.author.id }
    const updateDocument = {
      $set: {
        hgd: Number(userdata.hgd) + Number(amount),
        tag: message.author.tag,
        avatarURL: message.author.displayAvatarURL()
      }
    }

    if (updateDocument.$set.hgd >= 45000 && userdata.highLvLocked) {
      updateDocument.$set.hgd = 45000
    }

    const date = new Date()
    updateDocument.$set[`last${action}`] = Math.floor(date.getTime() / 1000)
    await collection.updateOne(filter, updateDocument)
    return {
      oldHgd: Number(userdata.hgd),
      newHgd: updateDocument.$set.hgd,
      locked: updateDocument.$set.hgd === 45000 && userdata.highLvLocked
    }
  } catch (e) {
    const erro = new Error(e)
    printLog('ERR', __filename, erro)
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
      tag: message.author.tag,
      avatarURL: message.author.displayAvatarURL(),
      sCNum: false,
      sID: false,
      sName: false,
      sClass: false,
      lastAfternoonTea: 0,
      lastFile: 0,
      lastPat: 0,
      lastRose: 0,
      lastRoseTea: 0,
      snowflake: message.author.id
    }

    const date = new Date()
    newUdata[action] = Math.floor(date.getTime() / 1000)
    await collection.insertOne(newUdata)
    return
  } catch (e) {
    const erro = new Error(e)
    printLog('ERR', __filename, erro)
    message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}

async function getData (message) {
  try {
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')
    const query = { snowflake: message.author.id }
    const options = {
      sort: { _id: -1 }
    }
    const data = await collection.findOne(query, options)
    printLog('info', __filename, JSON.stringify(data))
    return data
  } catch (e) {
    const erro = new Error(e)
    printLog('ERR', __filename, erro)
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
    printLog('ERR', __filename, e)
  }
}

async function checkNew (message) {
  try {
    const data = await getData(message)
    if (!data) return false
    return true
  } catch (e) {
    printLog('ERR', __filename, e)
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
    const index = result.map(i => i.snowflake).indexOf(message.author.id)
    return index == null ? '?' : index + 1
  } catch (e) {
    printLog('ERR', __filename, e)
  }
}

async function getTimeDiff (message, action, overrideTime) {
  const data = await getData(message)
  const lastAction = data?.[`last${action}`] || 0

  const date = new Date()
  const timeForCompare = overrideTime || Math.floor(date.getTime() / 1000)

  return timeForCompare - lastAction
}

async function checkLevel (message, requirement = -1) {
  const data = await getData(message)
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
  printLog(
    'INFO',
    __filename,
    `Level : ${finalLevel}, min : ${lowerLimit}, max : ${upperLimit}`
  )

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
  printLog('INFO', __filename, `Stage: ${stage}; Percentage: ${percentage}`)
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
  if (range[0] > range[1]) {
    return (
      (timeNow >= range[0] && timeNow <= '23:59') ||
      (timeNow <= range[1] && timeNow >= '00:00')
    )
  }
  return timeNow >= range[0] && timeNow <= range[1]
}

function n (num) {
  return num.toString().padStart(2, '0')
}

async function spinShard (message, multiplier = 1) {
  const levels = require('../commands/Hgd/config/levels.json')
  const data = await getData(message)
  const level = getLevel(data?.hgd).value || 0
  const shardPossibility = levels[level].shardPerc * 0.01 * multiplier
  const randomNumber = Math.random()
  printLog(
    'INFO',
    __filename,
    `Shard possibility: ${shardPossibility}, Random: ${randomNumber}`
  )
  if (randomNumber < shardPossibility) {
    try {
      const database = mdbclient.db('jane')
      const collection = database.collection('hgdv2')

      const query = { snowflake: message.author.id }
      const options = {
        sort: { _id: -1 }
      }
      const userdata = await collection.findOne(query, options)

      const filter = { snowflake: message.author.id }
      const updateDocument = {
        $set: {
          shards: userdata.shards + 1
        }
      }
      await collection.updateOne(filter, updateDocument)

      const getShardEmbed = new MessageEmbed()
        .setColor('#FB9EFF')
        .setAuthor(
          `Lv.${level} ${message.author.tag}`,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `<:JANE_LightStickL:936956753944383508> 獲得了一個 __好感度解放碎片__ (${userdata.shards} \u279f ${updateDocument.$set.shards}) <:JANE_LightStickR:936956856604180480>`
        )
      return message.reply({ embeds: [getShardEmbed] })
    } catch (e) {
      const erro = new Error(e)
      printLog('ERR', __filename, erro)
      message.reply('很抱歉，簡的資料庫發生了錯誤')
    }
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

    await collection.updateOne(filter, updateDocument)

    const level = getLevel(userdata.hgd).value
    await interaction.message.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor(
            `Lv.${level} | ${interaction.user.tag}`,
            interaction.user.displayAvatarURL()
          )
          .setTitle('已解放好感度等級上限')
          .setDescription(
            `等級上限: Lv.30 \u279f Lv.40 \n好感度解放碎片持有數: ${userdata.shards} \u279f ${updateDocument.$set.shards}`
          )
          .setColor('#FB9EFF')
      ]
    })
  } catch (e) {
    const erro = new Error(e)
    printLog('ERR', __filename, erro)
    interaction.message.reply('很抱歉，簡的資料庫發生了錯誤')
  }
}
