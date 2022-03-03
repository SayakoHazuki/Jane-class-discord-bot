const Discord = require('discord.js')
const Command = require('cmd')

const getCovData = require('../../Utils/getCovData')

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
    let {
      buildings,
      overviewBefore,
      overviewNow,
      updatedToday
    } = await getCovData()

    const dayString = updatedToday ? '本日' : '昨日'

    const buildingsNumber = buildings.length
    if (buildingsNumber >= 50) {
      buildings = buildings.slice(0, 45)
      buildings.push(
        ` ...[(還有${buildingsNumber -
          45}項)](https://www.chp.gov.hk/files/pdf/building_list_chi.pdf)`
      )
    }
    const covidEmbed = new Discord.MessageEmbed()
      .setTitle('2019冠狀病毒病-香港最新情況')
      .setURL('https://chp-dashboard.geodata.gov.hk/covid-19/en.html')
      .setDescription(
        `本日數據${
          updatedToday ? '已' : '尚未'
        }更新\n> ${dayString}新增 ${overviewNow.case -
          overviewBefore.case} 宗個案, 累計 ${overviewNow.case} 宗\n> 多 ${overviewNow.death - overviewBefore.death} 患者離世, 累計死亡個案 ${
          overviewNow.death
        } 宗\n> 截至${updatedToday ? '本日' : '昨日'}仍有 ${
          overviewNow.crit
        } 名住院患者危殆`
      )
      .addField(
        `沙田區14日內曾有確診人士居住的大廈列表 (共${buildingsNumber}項)`,
        `${buildings.join('')}`
      )
      .setColor(this.client.colors.yellow)

    message.reply({ embeds: [covidEmbed] })
  }
}
