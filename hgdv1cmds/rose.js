const Discord = require('discord.js')
const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const hgd = require('hgdUtils')
const Util = require('utils')

const Command = require('cmd')

module.exports = class hgdCommand extends Command {
  constructor (client) {
    super(client, {
      name: '給簡贈送一支白玫瑰',
      aliases: ['送簡一支白玫瑰', '送簡一枝白玫瑰', '給簡贈送一枝白玫瑰'],
      category: '好感度',
      description: '給簡贈送一支白玫瑰',
      usage: '給簡贈送一支白玫瑰',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    function rd (min, max) {
      const r = Math.random() * (max - min) + min
      return r - (r % 1)
    }
    let simrose = false
    let score
    if (simrose === true) {
      score = rd(0, 1)
    } else {
      score = rd(2, 18)
    }
    simrose = true
    setTimeout(function () {
      simrose = false
    }, 10000)
    const d = new Date()
    add(score, d, message)

    async function add (value, time, msg) {
      let last, diff
      try {
        const userdata = await hgd.getdata(client, msg)
        if (typeof userdata !== 'undefined' && userdata) {
          last = new Date(userdata.rose)
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
              const collection = database.collection('hgdv2')
              const filter = { name: msg.author.id }
              const updateDocument = {
                $set: {
                  rose: time,
                  tag: msg.author.tag
                }
              }
              await collection.updateOne(filter, updateDocument)
              const replyEmbed = new Discord.MessageEmbed()
                .setColor('#FB9EFF')
                .setTitle(`${msg.member.displayName} 送了一支白玫瑰給簡`)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
                .setDescription('簡 對你的行動沒什麼感覺。\n好感度 不變')
                .setTimestamp()
                .setFooter('簡', '')
              msg.channel.send({ embeds: [replyEmbed] })
              throw new Error('stop')
            } else {
              value = 1
            }
          }
        } else {
          diff = 10000
        }

        Util.printLog('info', __filename, `diff: ${diff}`)
        if (diff < 15) {
          const rvalue = rd(4, 12)
          await hgd.subtract(client, msg, 'rose', rvalue)
          const replyEmbed = new Discord.MessageEmbed()
            .setColor('#FB9EFF')
            .setTitle(`${msg.member.displayName} 送了一支白玫瑰給簡`)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
            .setDescription(
              `你不久前才送了一支白玫瑰給簡, 讓簡感到不太自在\n好感度-${rvalue}`
            )
            .setTimestamp()
            .setFooter('感到不自在的簡', '')
          msg.channel.send({ embeds: [replyEmbed] })
          throw new Error('stop')
        } else {
          if (typeof userdata !== 'undefined' && userdata) {
            await hgd.add(client, msg, 'rose', value)
          } else {
            await hgd.npf(client, msg, 'rose', value)
          }
        }
      } catch (e) {
        if (e.message === 'stop') return Util.printLog('err', __filename, e)
      }
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(`${msg.member.displayName} 送了一支白玫瑰給簡`)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
        .setDescription(
          `簡 感到${value >= 12 ? '好開心' : '開心'}\n好感度+${value}`
        )
        .setTimestamp()
        .setFooter('感到開心的簡', '')
      msg.channel.send({ embeds: [replyEmbed] })
    }
  }
}
