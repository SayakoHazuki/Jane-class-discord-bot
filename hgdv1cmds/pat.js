const Discord = require('discord.js')
const hgd = require('hgdUtils')
const Command = require('cmd')
const Util = require('utils')

function rd (min, max) {
  const r = Math.random() * (max - min) + min
  return r - (r % 1)
}
let simpat = false

module.exports = class HgdPatCommand extends Command {
  constructor (client) {
    super(client, {
      name: '拍拍簡的頭',
      category: '好感度',
      description: '拍拍簡的頭',
      usage: '拍拍簡的頭',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    let score
    if (simpat === true) {
      score = rd(0, 2)
    } else {
      score = rd(8, 12)
    }
    simpat = true
    setTimeout(function () {
      simpat = false
    }, 10000)
    const d = new Date()
    add(score, d, message)

    async function add (value, time, msg) {
      let last, diff
      try {
        const userdata = await hgd.getdata(client, msg)
        if (typeof userdata !== 'undefined' && userdata) {
          last = new Date(userdata.pat)
          diff = Math.floor((time - last) / 60000)
          if (msg.author.id === '726439536401580114') {
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
              await hgd.subtract(client, msg, 'pat', 1)
              const replyEmbed = new Discord.MessageEmbed()
                .setColor('#FB9EFF')
                .setTitle(`${msg.member.displayName} 拍了簡的頭`)
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
        if (diff < 30) {
          const rvalue = rd(4, 12)
          await hgd.subtract(client, msg, 'pat', rvalue)
          const replyEmbed = new Discord.MessageEmbed()
            .setColor('#FB9EFF')
            .setTitle(`${msg.member.displayName} 拍了簡的頭`)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
            .setDescription(
              `你拍得太頻繁, 簡 希望你適可而止。\n好感度-${rvalue}`
            )
            .setTimestamp()
            .setFooter('感到不自在的簡', '')
          msg.channel.send({ embeds: [replyEmbed] })
          throw new Error('stop')
        } else {
          if (typeof userdata !== 'undefined' && userdata) {
            await hgd.add(client, msg, 'pat', value)
          } else {
            await hgd.subtract(client, msg, 'pat', value)
          }
        }
      } catch (e) {
        if (e.message === 'stop') {
          return Util.printLog('info', __filename, 'stop request received in files.js')
        }
        client.channels.cache
          .get('802138894623571979')
          .send(
            `Caught error:\n${e}\nat pat:js line 82\n\nuser : ${msg.author.tag}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
          )
      }
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(`${msg.member.displayName} 拍了簡的頭`)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL(), '')
        .setDescription(`簡 感到開心\n好感度+${value}`)
        .setTimestamp()
        .setFooter('感到開心的簡', '')
      msg.channel.send({ embeds: [replyEmbed] })
    }
  }
}
