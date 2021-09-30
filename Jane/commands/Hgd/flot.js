const Discord = require('discord.js')
const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const hgd = require('hgdUtils')
const Util = require('utils')

let simflot = false

const Command = require('cmd')

module.exports = class HgdFlotCommand extends Command {
  constructor (client) {
    super(client, {
      name: '請簡喝花茶',
      category: '好感度',
      description: '請簡喝花茶',
      usage: '請簡喝花茶',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    Util.printLog('info', __filename, `simflot = ${simflot}`)
    let score
    if (simflot === true) {
      score = hgd.rd(5, 8)
    } else {
      score = hgd.rd(8, 20)
    }
    simflot = true
    setTimeout(function () {
      simflot = false
    }, 10000)
    const d = new Date()
    add(score, d, message)

    async function add (value, time, msg) {
      let last, diff
      try {
        const userdata = await hgd.getdata(client, msg)
        if (typeof userdata !== 'undefined' && userdata) {
          last = new Date(userdata.flot)
          diff = Math.floor((time - last) / 60000)
          if (userdata.name === '726439536401580114') {
            diff = 10000
            value = hgd.rd(15, 35)
          }
          if (
            userdata.hgd < 0 &&
            diff >= 30 &&
            msg.author.id !== '726439536401580114'
          ) {
            const chance = hgd.rd(1, 100)
            Util.printLog('info', __filename, `chance: ${chance}`)
            if (chance < 71) {
              await mdbclient.connect()
              const database = mdbclient.db('jane')
              const collection = database.collection('hgd')
              const filter = { name: msg.author.id }
              const updateDocument = {
                $set: {
                  flot: time,
                  tag: msg.author.tag
                }
              }
              await collection.updateOne(filter, updateDocument)
              const replyEmbed = new Discord.MessageEmbed()
                .setColor('#FB9EFF')
                .setTitle(`${msg.member.displayName} 給了簡一杯花茶`)
                .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
                .setDescription('簡 不太喜歡你的花茶。\n好感度 不變')
                .setTimestamp()
                .setFooter('簡', '')
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
        if (diff < 30) {
          const rvalue = hgd.rd(0, 3)
          await hgd.subtract(client, msg, 'flot', rvalue)
          const replyEmbed = new Discord.MessageEmbed()
            .setColor('#FB9EFF')
            .setTitle(`${msg.member.displayName} 給了簡一杯花茶`)
            .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
            .setDescription(`簡 不久前已經喝了你給的花茶\n好感度-${rvalue}`)
            .setTimestamp()
            .setFooter('簡', '')
          msg.channel.send(replyEmbed)
          throw new Error('stop')
        } else {
          if (typeof userdata !== 'undefined' && userdata) {
            await hgd.add(client, msg, 'flot', value)
          } else {
            await hgd.npf(client, msg, 'flot', value)
          }
        }
      } catch (e) {
        if (e === 'stop') return Util.printLog('info', __filename, 'stop request received in flot.js')
        client.channels.cache
          .get('802138894623571979')
          .send(
            `Caught error:\n${e}\nat flot:js line 108\n\nuser : ${msg.author.tag}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
          )
      }
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(`${msg.member.displayName} 給了簡一杯花茶`)
        .setAuthor(msg.member.displayName, msg.author.avatarURL(), '')
        .setDescription(
          `簡 ${value >= 15 ? '非常喜歡' : '喜歡'}你給的花茶\n好感度+${value}`
        )
        .setTimestamp()
        .setFooter('喜歡喝花茶的簡', '')
      msg.channel.send(replyEmbed)
    }
  }
}
