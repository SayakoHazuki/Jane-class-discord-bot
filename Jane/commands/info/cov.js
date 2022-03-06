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
    const reply = await message.reply('正在獲取相關數據...')

    let {
      buildings,
      overviewBefore,
      overviewNow,
      updatedToday,
      news
    } = await getCovData()

    const { possiblyRelatedNews, relatedNews } = news

    const dayString = updatedToday ? '本日' : '昨日'

    const buildingsNumber = buildings.length
    if (buildingsNumber >= 30) {
      buildings = buildings.slice(0, 27)
      buildings.push(
        ` ...[(還有${buildingsNumber -
          27}項)](https://www.chp.gov.hk/files/pdf/building_list_chi.pdf)`
      )
    }
    const fields = [
      {
        name: `沙田區14日內曾有確診人士居住的大廈列表 (共${buildingsNumber}項)`,
        value: `${buildings.join('')}`
      }
    ]
    if (relatedNews?.length) {
      fields.push({
        name: '\u2800',
        value: '__**相關新聞** (按更新時間排序)__'
      })
      for (const { title, link, description, time, mediaName } of relatedNews) {
        fields.push({
          name: `【${mediaName || '?'}】 ${(title?.length >= 28
            ? title.substring(0, 25) + '...'
            : title) || '沒有標題'}`,
          value: `<t:${time}:R> ${description ||
            '(沒有內容)'} [新聞連結](${link ||
            'https://news.google.com'})\n\u2800`
        })
      }
    }
    if (possiblyRelatedNews?.length) {
      fields.push({
        name: '\u2800',
        value: '__**疑似相關新聞** (按更新時間排序)__'
      })
      for (const {
        title,
        link,
        description,
        time,
        mediaName
      } of possiblyRelatedNews) {
        fields.push({
          name: `【${mediaName || '?'}】 ${(title?.length >= 28
            ? title.substring(0, 25) + '...'
            : title) || '沒有標題'}`,
          value: `<t:${time}:R> ${description ||
            '(沒有內容)'} [新聞連結](${link ||
            'https://news.google.com'})\n\u2800`
        })
      }
    }
    const covidEmbed = new Discord.MessageEmbed()
      .setTitle('2019冠狀病毒病-香港最新情況')
      .setURL('https://chp-dashboard.geodata.gov.hk/covid-19/en.html')
      .setDescription(
        `本日數據${
          updatedToday ? '已' : '尚未'
        }更新\n> ${dayString}新增 ${overviewNow.case -
          overviewBefore.case} 宗個案, 累計 ${
          overviewNow.case
        } 宗\n> 多 ${overviewNow.death -
          overviewBefore.death} 患者離世, 累計死亡個案 ${
          overviewNow.death
        } 宗\n> 截至${updatedToday ? '本日' : '昨日'}仍有 ${
          overviewNow.crit
        } 名住院患者危殆`
      )
      .addFields(fields)
      .setColor(this.client.colors.yellow)

    await reply.edit({ content: '\u2800', embeds: [covidEmbed] })
  }
}
