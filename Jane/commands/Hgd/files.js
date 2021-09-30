const Discord = require('discord.js')
const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const hgd = require('hgdUtils')
const Command = require('cmd')
const Util = require('utils')

function rd (min, max) {
  const r = Math.random() * (max - min) + min
  return r - (r % 1)
}
let simfiles = false
let score

module.exports = class HgdFilesCommand extends Command {
  constructor (client) {
    super(client, {
      name: '幫助簡整理資料',
      aliases: ['幫簡整理資料'],
      category: '好感度',
      description: '幫助簡整理資料',
      usage: '幫助簡整理資料',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    Util.printLog('info', __filename, `simfiles = ${simfiles}`)

    if (simfiles === true) {
      score = rd(0, 2)
    } else {
      score = rd(8, 12)
    }
    simfiles = true
    setTimeout(function () {
      simfiles = false
    }, 10000)
    const d = new Date()
    add(score, d, message)

    async function add (value, time, msg) {
      let last, diff
      try {
        const userdata = await hgd.getdata(client, msg)
        if (typeof userdata !== 'undefined' && userdata) {
          last = new Date(userdata.files)
          diff = Math.floor((time - last) / 60000)
          if (userdata.name === '726439536401580114') {
            diff = 10000
            value = rd(15, 35)
          }
          if (
            userdata.hgd < 0 &&
            diff >= 15 &&
            msg.author.id !== '726439536401580114'
          ) {
            const chance = rd(1, 100)
            Util.printLog('info', __filename, `chance: ${chance}`)
            if (chance < 71) {
              await mdbclient.connect()
              const database = mdbclient.db('jane')
              const collection = database.collection('hgd')
              const filter = { name: msg.author.id }
              const updateDocument = {
                $set: {
                  files: time,
                  tag: msg.author.tag
                }
              }
              await collection.updateOne(filter, updateDocument)
              const replyEmbed = new Discord.MessageEmbed()
                .setColor('#FB9EFF')
                .setTitle(`${msg.member.displayName} 幫助了簡整理資料`)
                .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
                .setDescription('簡 對你的行動沒什麼感覺。\n好感度 不變')
                .setTimestamp()
                .setFooter('感到討厭的簡', '')
              msg.channel.send(replyEmbed)
              throw new Error('stop')
            } else {
              value = 1
            }
          }
        } else {
          diff = 10000
        }

        Util.printLog('info', __filename, diff)
        if (diff < 15) {
          const rvalue = rd(4, 12)
          await hgd.subtract(client, msg, 'files', rvalue)
          const replyEmbed = new Discord.MessageEmbed()
            .setColor('#FB9EFF')
            .setTitle(`${msg.member.displayName} 幫助了簡整理資料`)
            .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
            .setDescription(
              `你不久前才整理了一次, 讓簡感到不太自在\n好感度-${rvalue}`
            )
            .setTimestamp()
            .setFooter('感到不自在的簡', '')
          msg.channel.send(replyEmbed)
          throw new Error('stop')
        } else {
          if (typeof userdata !== 'undefined' && userdata) {
            await hgd.add(client, msg, 'files', value)
          } else {
            await hgd.npf(client, msg, 'files', value)
          }
        }
      } catch (e) {
        if (e.message === 'stop') {
          return Util.printLog('info', __filename, 'stop request received in files.js')
        }
        client.channels.cache
          .get('802138894623571979')
          .send(
            `Caught error:\n${e}\nat files:js line 108\n\nuser : ${msg.author.tag}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
          )
      }
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(`${msg.member.displayName} 幫助了簡整理資料`)
        .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
        .setDescription(`簡 感到開心\n好感度+${value}`)
        .setTimestamp()
        .setFooter('感到開心的簡', '')
      msg.channel.send(replyEmbed)
    }
  }
}
