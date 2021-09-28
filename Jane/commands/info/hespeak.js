const Discord = require('discord.js')
const skuday = require('./data/sd.json')
const Command = require('cmd')
const Util = require('utils')

module.exports = class HeSpeakCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hespeak',
      aliases: ['he', 'speak', 'speaking'],
      category: '資訊',
      description: '顯示HE/Speaking的課堂安排',
      usage: 'hespeak [Cycle]',
      minArgs: 0,
      maxArgs: 1
    })
  }

  async run (message, args) {
    if (message) return message.inlineReply('本指令暫時無法使用')
    let b1, b2
    Util.printLog('info', __filename, 'isNaN arg: ' + isNaN(args[0]))
    if ((args[0] && args[0] !== 'next' && isNaN(args[0])) || args[0] > 70) {
      return message.inlineReply(Util.errEmbed(message, `簡找不到 Cycle ${args[0].length > 5 ? args[0].substring(0, 4) + '...' : args[0]}`, false))
    }
    if (args[0] === 'next' || !args[0]) {
      for (let i = 0; i < 15; i++) {
        if (i === 14) {
          message.inlineReply(Util.InfoEmbed(message, '未來兩週沒有 HE / Speaking 課堂', false))
          break
        }
        let readarg
        const dayoffset = i * 24
        const offset = this.client.timezoneOffset + dayoffset
        const DateToday = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace(/ GMT$/, '')
        Util.printLog('info', __filename, `DateToday: ${DateToday}`)
        const todayargs = DateToday.split(' ')
        const DayDate = todayargs[1]
        const MonthDate = todayargs[2]
        const readToday = DayDate + MonthDate
        try {
          readarg = skuday[readToday].split(' ')
        } catch (e) {
          Util.handleErr(e)
          Util.printLog('err', __filename, e.message)
          message.inlineReply('發生了一個錯誤')
          break
        }

        if (readarg) {
          const cycle = readarg[1] ? readarg[1] : ''
          const cycleDay = readarg[3] ? readarg[3] : ''
          if (cycleDay === 'D' || cycleDay === 'H') {
            if (cycle % 2 === 0) {
              b1 = '2,6,10,14,18,22,26,30'
              b2 = '4,8,12,16,20,24,28'
              const f1v = `${(cycleDay === 'D') ? `H.E.: 單數\nMr. Ho: ${b1}\nMs. Lam: ${b2}` : `H.E.: 單數\nMr. Ho: ${b2}\nMs. Lam: ${b1}`}`
              const hespeakEmbed = new Discord.MessageEmbed()
                .setColor(this.client.themeColor)
                .setTitle(`HE/Speaking lessons of Cycle ${cycle} Day ${cycleDay}`)
                .setDescription(DateToday.replace(/ ..:..:../g, '') + '\n\n' + f1v)
              message.inlineReply('', hespeakEmbed)
              break
            } else {
              const f1v = `${(cycleDay === 'D') ? 'H.E.: 雙數\nMr. Ho: A1\nMs. Lam: A2' : 'H.E.: 雙數\nMr. Ho: 3,7,11,15,19,23,27,31\nMs. Lam: 1,5,9,13,17,21,25,29'}`
              const hespeakEmbed = new Discord.MessageEmbed()
                .setColor(this.client.themeColor)
                .setTitle(`HE/Speaking lessons of Cycle ${cycle} Day ${cycleDay}`)
                .setDescription(DateToday.replace(/ ..:..:../g, '') + '\n\n' + f1v)
              return message.inlineReply('', hespeakEmbed)
            }
          }
        } else {
          message.inlineReply('發生了一個錯誤 (50071)')
          break
        }
      }
      return
    }
    if (args[0] % 2 === 0) {
      const f1n = 'Cycle ' + args[0] + ' Day D'
      const f1v = 'H.E.: 單數\nMr. Ho: B1\nMs. Lam: B2'
      const f2n = 'Cycle ' + args[0] + ' Day H'
      const f2v = 'H.E.: 單數\nMr. Ho: B2\nMs. Lam: B1'
      const hespeakEmbed = new Discord.MessageEmbed()
        .setColor(this.client.themeColor)
        .addFields({
          name: f1n,
          value: f1v,
          inline: true
        }, {
          name: f2n,
          value: f2v,
          inline: true
        })
        .setTitle(`HE/Speaking lessons of Cycle ${args[0]}`)
        .setDescription('A1 : 1,5,9,13,17,21,25,29\nA2 : 3,7,11,15,19,23,27,31\nB1 : 2,6,10,14,18,22,26,30\nB2 : 4,8,12,16,20,24,28\n━━━━━━━━━━━━━\n')
      message.inlineReply('', hespeakEmbed)
    } else {
      const f1n = 'Cycle ' + args[0] + ' Day D'
      const f1v = 'H.E.: 雙數\nMr. Ho: A1\nMs. Lam: A2'
      const f2n = 'Cycle ' + args[0] + ' Day H'
      const f2v = 'H.E.: 雙數\nMr. Ho: A2\nMs. Lam: A1'
      const hespeakEmbed = new Discord.MessageEmbed()
        .setColor(this.client.themeColor)
        .addFields({
          name: f1n,
          value: f1v,
          inline: true
        }, {
          name: f2n,
          value: f2v,
          inline: true
        }, {
          name: 'Links',
          value: '<:zoom:806692711141736458> HE\nhttps://zoom.us/j/96494553885?pwd=bzA4elFGQUNnZFlGTVcwakttNU5hUT09\n<:meet:806692710790070283> SPEAK (Mr.Ho)\nhttps://meet.google.com/lookup/h6w6trj4oi?authuser=0&hs=179\n<:zoom:806692711141736458> SPEAK (NET)\nhttps://zoom.us/j/3444298130?pwd=RFRJUDBqSnVTYmlXWWs1a2NlSi9DQT09'
        })
        .setTitle(`HE/Speaking lessons of Cycle ${args[0]}`)
        .setDescription('A1 : 1,5,9,13,17,21,25,29\nA2 : 3,7,11,15,19,23,27,31\nB1 : 2,6,10,14,18,22,26,30\nB2 : 4,8,12,16,20,24,28\n━━━━━━━━━━━━━\n')
      message.inlineReply('', hespeakEmbed)
    }
  }
}
