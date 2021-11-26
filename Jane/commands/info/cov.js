const Discord = require('discord.js')
const Command = require('cmd')
const Util = require('utils')

module.exports = class CovidCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'covid',
      aliases: ['cov'],
      category: '資訊',
      description: '顯示疫情資訊',
      usage: 'cov',
      minArgs: 0,
      maxArgs: 1
    })
  }

  async run (message, args) {
    const debug = (args[0] === '-debug')
    const embedColor = this.client.colors.yellow

    Util.getCovidData(function ([dataDate, cfd, dts, rec, crit, hosp, infperc, fullData]) {
      const debugLog = JSON.stringify([dataDate, cfd, dts, rec, crit, hosp, infperc])
      if (debug) {
        Util.splitSend(message.channel, `${debugLog}`, 'js')
        Util.splitSend(message.channel, fullData, 'js')
      }
      const covid19StatusHK = new Discord.MessageEmbed()
        .setColor(embedColor)
        .setTitle('2019冠狀病毒病毒-香港最新情況')
        .setDescription(dataDate)
        .setURL('https://chp-dashboard.geodata.gov.hk/covid-19/en.html')
        .addFields({
          name: '確診個案',
          value: cfd,
          inline: true
        }, {
          name: '死亡個案',
          value: dts,
          inline: true
        }, {
          name: '康復個案',
          value: rec,
          inline: true
        }, {
          name: '危殆個案',
          value: crit,
          inline: true
        }, {
          name: '住院個案',
          value: hosp,
          inline: true
        }, {
          name: '感染比例',
          value: infperc,
          inline: true
        })
        .setTimestamp()
        .setFooter('數據來源:chp-dashboard.geodata.gov.hk', '')
      message.reply({embeds: [covid19StatusHK]})
    })
  }
}
