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
    const { vaccine, covid } = await getCovData()

    const covidEmbed = new Discord.MessageEmbed()
      .setTitle('2019冠狀病毒病-香港最新情況')
      .setURL('https://chp-dashboard.geodata.gov.hk/covid-19/en.html')
      .setDescription(`數據截至 <t:${covid.updateTime}:f>`)
      .addFields(
        {
          name: '疫苗數據',
          value: `疫苗接種劑次: ${vaccine.totalDoses} (+${vaccine.latestDay})\n\u2800第一針 ${vaccine.doses[0].total} (+${vaccine.doses[0].daily}) [${vaccine.doses[0].percent}%人口]\n\u2800第二針 ${vaccine.doses[1].total} (+${vaccine.doses[1].daily}) [${vaccine.doses[1].percent}%人口]\n\u2800第三針 ${vaccine.doses[2].total} (+${vaccine.doses[2].daily}) [未公布百分比數據]\n本週每日平均接種: ${vaccine.sevenDayAvg} 劑次\n5-11歲小童接種情況:\n\u2800第一針 ${vaccine.child.doses[0].total} (${vaccine.child.doses[0].percent}小童人口)\n\u2800第二針 ${vaccine.child.doses[1].total} (${vaccine.child.doses[1].percent}小童人口)`
        },
        {
          name: '疫情數據',
          value: `陽性個案數量 ${covid.positiveTotal}\n\u2800(確診 ${covid.confirmedTotal}\u2800無病徵 ${covid.asymptomaticTotal}\u2800復陽 ${covid.repositiveTotal})\n\u2800住院中 ${covid.hospitalizedTotal}\u2800死亡個案 ${covid.deathTotal}\n本日新增個案 ${covid.daily.total}\n\u2800(本地源頭不明 ${covid.daily.local}\u2800其餘本地個案 ${covid.daily.localRelated}\n\u2800 輸入源頭不明 ${covid.daily.import}\u2800輸入其餘個案 ${covid.daily.importRelated})`
        }
      )
      .setColor(this.client.colors.yellow)

    message.reply({ embeds: [covidEmbed] })
  }
}
