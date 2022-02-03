const Discord = require('discord.js')
const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const hgd = require('hgdUtils')
const Util = require('utils')

const Command = require('cmd')

module.exports = class HgdTeaCommand extends Command {
  constructor (client) {
    super(client, {
      name: '給簡準備下午茶',
      category: '好感度',
      description: '給簡準備下午茶',
      usage: '給簡準備下午茶',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    let simtea = false
    const hr = Number(new Date().getHours()) + 0
    let score
    if (hr !== 14 && hr !== 15 && hr !== 16) {
      return message.channel.send('現在不是下午茶的時間喔')
    }
    if (simtea === true) {
      score = hgd.rd(12, 25)
    } else {
      score = hgd.rd(12, 35)
    }
    simtea = true
    setTimeout(function () {
      simtea = false
    }, 10000)
    const d = new Date()
    add(score, d, message)

    async function add (value, time, msg) {
      let last, diff
      try {
        const userdata = await hgd.getdata(client, msg)
        if (typeof userdata !== 'undefined' && userdata) {
          last = new Date(userdata.tea)
          diff = Math.floor((time - last) / 60000)
          if (msg.author.id === '726439536401580114') {
            diff = 10000
            value = hgd.rd(35, 90)
          }
          if (
            userdata.hgd < 0 &&
            diff >= 15 &&
            msg.author.id !== '726439536401580114'
          ) {
            const chance = hgd.rd(1, 100)
            Util.printLog('info', __filename, `chance: ${chance}`)
            if (chance < 71) {
              await mdbclient.connect()
              const database = mdbclient.db('jane')
              const collection = database.collection('hgdv2')
              const filter = { name: msg.author.id }
              const updateDocument = {
                $set: {
                  tea: time,
                  hgd: Number(userdata.hgd) - 1,
                  tag: msg.author.tag
                }
              }
              await collection.updateOne(filter, updateDocument)
              const replyEmbed = new Discord.MessageEmbed()
                .setColor('#FB9EFF')
                .setTitle(`${msg.member.displayName} 給簡準備了下午茶`)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
                .setDescription('簡 感到討厭。\n好感度 - 1')
                .setTimestamp()
                .setFooter('感到討厭的簡', '')
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
        if (diff < 300) {
          const rvalue = hgd.rd(0, 4)
          await hgd.subtract(client, msg, 'tea', rvalue)
          const replyEmbed = new Discord.MessageEmbed()
            .setColor('#FB9EFF')
            .setTitle(`${msg.member.displayName} 給簡準備了下午茶`)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
            .setDescription(`你今天已經給簡準備過下午茶了\n好感度-${rvalue}`)
            .setTimestamp()
            .setFooter('簡', '')
          msg.channel.send({ embeds: [replyEmbed] })
          throw new Error('stop')
        } else {
          if (typeof userdata !== 'undefined' && userdata) {
            await hgd.add(client, msg, 'tea', value)
          } else {
            await hgd.npf(client, msg, 'tea', value)
          }
        }
      } catch (e) {
        Util.printLog('err', __filename, e)
        if (e.message === 'stop') return
      }
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(`${msg.member.displayName} 給簡準備了下午茶`)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
        .setDescription(`簡 感到開心\n好感度+${value}`)
        .setTimestamp()
        .setFooter('感到開心的簡', '')
      msg.channel.send({ embeds: [replyEmbed] })
    }
  }
}
