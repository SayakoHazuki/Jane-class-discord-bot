const { MessageEmbed } = require('discord.js')
const daysJson = require('../commands/info/data/sd.json')
const timetableJson = require('../commands/info/data/tt.json')
const lessonLinksJson = require('../commands/info/data/classlink.json')

const terminal = require('./terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

function getMonthFromString (mon) {
  return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1
}

module.exports = class TimetableEmbed {
  constructor (
    dateToRead,
    timeOfSchool = 'onlineFull',
    showLinks = true,
    sClass
  ) {
    if (
      sClass !== '3A' &&
      sClass !== '3B' &&
      sClass !== '3C' &&
      sClass !== '3D'
    ) {
      return
    }
    let cycleNum, cycleDay, lessonsString, oddCycle
    const dayDescArray = daysJson[dateToRead].split(' ')
    if (!dayDescArray) {
      return printLog('info', __filename, 'dayDescArray is undefined')
    }
    if (dayDescArray[4]) {
      cycleNum = dayDescArray[1]
      printLog('info', __filename, 'let cycle = ' + cycleNum)
      if (Number(cycleNum) % 2 === 0) {
        oddCycle = false
      } else if (Number(cycleNum) % 2 === 1) {
        oddCycle = true
      }
    }

    if (!oddCycle) {
      //
    }

    const MonthNoTmr = getMonthFromString(dateToRead.replace(/[0-9]/g, ''))
    const DayDateTmr = dateToRead.replace(/[a-zA-Z]/g, '')

    if (dayDescArray[3]) {
      if (dayDescArray[0].includes('測驗周')) {
        const testsEmbed = new TestEmbed(
          dayDescArray[2],
          new Date(
            `2021-${toTwoDigit(MonthNoTmr)}-${toTwoDigit(DayDateTmr)}T12:00:00`
          ),
          daysJson[dateToRead].split('(')[1].replace(/[()]/g, '') || ''
        )
        this.embed = testsEmbed
        return
      } else {
        cycleDay = dayDescArray[3]
      }
    } else {
      cycleDay = 'holiday'
      printLog('info', __filename, 'Holiday detected')
    }

    if (cycleDay.includes('TestDay')) {
      lessonsString = timetableJson.test[`Day${dayDescArray[3]}`]
    } else {
      lessonsString = timetableJson[sClass][cycleDay]
    }

    const lessonsArray = lessonsString.split(' ')

    if (lessonsArray[5]) {
      const dayDescString = dayDescArray.join(' ')
      if (dayDescString.includes('上午') && timeOfSchool) timeOfSchool = 'AM'
      if (dayDescString.includes('下午') && timeOfSchool) timeOfSchool = 'PM'
      if (dayDescString.includes('夏令') && timeOfSchool) {
        timeOfSchool = 'summer'
      }
      if (dayDescString.includes('特別') && timeOfSchool) {
        timeOfSchool = 'sp'
      }
      printLog(
        'info',
        __filename,
        dayDescString.includes('上午'),
        dayDescString.includes('下午'),
        dayDescString.includes('夏令')
      )
      let timetableReadable
      let timeList
      if (timeOfSchool || timeOfSchool === 'normal') {
        timeList = [
          '08:40 - 09:35',
          '09:35 - 10:30',
          '10:45 - 11:40',
          '11:40 - 12:35',
          '13:50 - 14:45',
          '14:45 - 15:40'
        ]
      }
      if (timeOfSchool === '21sp') {
        timeList = [
          '08:40 - ',
          '09:20 - ',
          '10:20 - ',
          '11:00 - ',
          '12:00 - ',
          '12:40 - '
        ]
      }
      if (timeOfSchool === 'AM') {
        timeList = [
          '08:15 - 08:55',
          '08:55 - 09:35',
          '09:35 - 10:15',
          '10:30 - 11:10',
          '11:10 - 11:50',
          '11:50 - 12:30'
        ]
      }
      if (timeOfSchool === 'PM') {
        timeList = [
          '13:30 - 14:05',
          '14:05 - 14:40',
          '14:40 - 15:15',
          '15:30 - 16:05',
          '16:05 - 16:40',
          '16:40 - 17:15'
        ]
      }
      if (timeOfSchool === 'summer') {
        timeList = [
          '08:30 - 09:20',
          '09:20 - 10:10',
          '10:25 - 11:15',
          '11:15 - 12:05',
          '13:10 - 14:00',
          '14:00 - 14:50'
        ]
      }
      if (timeOfSchool === 'sp') {
        timeList = [
          '08:30 - ',
          '09:10 - ',
          '10:10 - ',
          '10:50 - ',
          '11:50 - ',
          '12:30 - '
        ]
      }
      if (timeOfSchool === 'onlineFull') {
        timeList = [
          '08:15-09:10',
          '09:10-10:05',
          '10:25-11:20',
          '11:20-12:15',
          '13:50-14:45',
          '14:45-15:40'
        ]
      }

      let embedDesc = ''
      for (let i = 0; i < 6; i++) {
        let mdLink = ''
        const numEmojisArray = [
          ':one:',
          ':two:',
          ':three:',
          ':four:',
          ':five:',
          ':six:'
        ]
        const t = timeOfSchool
          ? timeList[i] + (timeOfSchool === '21sp' ? '' : '\n')
          : numEmojisArray[i] + ' '
        let subj = lessonsArray[i]
        let links
        if (subj === 'MUS/DE') {
          subj = oddCycle ? 'DE' : 'MUS'
        }
        if (subj === 'PE') {
          links = [
            lessonLinksJson[sClass]['PE-boys'],
            lessonLinksJson[sClass]['PE-girls']
          ]
        }
        if (subj === 'SPEAK') {
          links = [lessonLinksJson[sClass].ENG, lessonLinksJson[sClass].NET]
        }
        if (!['PE', 'SPEAK'].includes(subj)) {
          links = [lessonLinksJson[sClass][subj]]
          console.log(lessonLinksJson[sClass][subj])
        }
        if (links.length === 2) {
          const subjReadableName1 = subj === 'PE' ? 'PE(Boys)' : 'Speaking(ENG)'
          const subjReadableName2 =
            subj === 'PE' ? 'PE(Girls)' : 'Speaking(NET)'
          mdLink = `${
            links[0] === ''
              ? `[找不到${sClass} ${subjReadableName1}}的課室連結]`
              : `[按此進入${subjReadableName1}課室](${links[0]})`
          } / ${
            links[1] === ''
              ? `[找不到${sClass} ${subjReadableName2}}的課室連結]`
              : `[按此進入${subjReadableName2}課室](${links[1]})`
          }\n`
        }
        if (links.length === 1) {
          if (links[0] === '') {
            mdLink = `[找不到${sClass} ${subj}的課室連結]\n`
          } else {
            mdLink = `[按此進入 ${subj} 課室 (${
              links[0].includes('zoom') ? 'Zoom' : 'Meet'
            })](${links[0]})\n`
          }
        }
        const displayLink = showLinks ? mdLink : ''
        embedDesc += `${t}${subj} ${displayLink}\n`
        if (i === 5) timetableReadable = embedDesc
      }
      const foota = [
        '請記得準備所需教材喔',
        '請記得檢查功課是不是做完了喔',
        '明天也要加油喔'
      ]
      const random = Math.floor(Math.random() * foota.length)

      const JSDateForDay = new Date(
        `2021-${toTwoDigit(MonthNoTmr)}-${toTwoDigit(DayDateTmr)}T12:00:00`
      )
      printLog('info', __filename, `2021-${MonthNoTmr}-${DayDateTmr}T12:00:00`)
      printLog('info', __filename, JSDateForDay.getTime())

      const timetableEmbed = new MessageEmbed()
        .setAuthor(
          `[${sClass}] 日期資訊 Date info`,
          'https://i.imgur.com/wMfgtoW.png?1'
        )
        .setDescription(
          `━━━━━━━━━━━━━\n<t:${Math.round(
            JSDateForDay.getTime() / 1000
          )}:D> [${daysJson[dateToRead].split('(')[1].replace(/[()]/g, '') ||
            ''}]\n${daysJson[dateToRead].split('(')[0] ||
            daysJson[dateToRead]}\n\u2800`
        )
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/597ed679b7bdcfd32b22e2149a6222ce.webp'
        )
        .addField(
          '課堂列表',
          timetableReadable + `━━━━━━━━━━━━━\n${foota[random]}`
        )
        .setTimestamp()

      this.embed = timetableEmbed
    }
    if (!lessonsArray[5] && !dayDescArray[0].includes('測驗周')) {
      const JSDateForDay = new Date(
        `2021-${toTwoDigit(MonthNoTmr)}-${toTwoDigit(DayDateTmr)}T12:00:00`
      )
      const footaE = [
        '趁著難得的假期好好放鬆一下吧',
        '請好好享受假期吧',
        '最近真是辛苦了，休閒的度過假期吧',
        '會有特別的假期安排嗎？'
      ]
      const rdE = Math.floor(Math.random() * footaE.length)

      const holidayEmbed = new MessageEmbed()
        .setAuthor('日期資訊 Date info', 'https://i.imgur.com/wMfgtoW.png?1')
        .setDescription(
          `<t:${Math.round(JSDateForDay.getTime() / 1000)}:D>是假期喔 ${
            footaE[rdE]
          }`
        )
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/597ed679b7bdcfd32b22e2149a6222ce.webp'
        )
        .setTimestamp()

      this.embed = holidayEmbed
    }
  }
}

function toTwoDigit (deg) {
  return ('0' + deg).slice(-2)
}

class TestEmbed {
  constructor (testWeekDay, JSDateForDay, dayOfWeek) {
    const subjects = timetableJson.tests[testWeekDay - 1]
    const foota = [
      '希望大家都能獲得好的成績呢',
      '請努力溫習測驗哦',
      '大家測驗要加油哦',
      '請努力溫習測驗哦',
      '大家測驗要加油哦',
      '請努力溫習測驗哦',
      '大家測驗要加油哦',
      '請努力溫習測驗哦',
      '大家測驗要加油哦'
    ]
    const random = Math.floor(Math.random() * foota.length)

    function sumTime (o, a) {
      let [oh, om] = o.split(':')
      ;[oh, om] = [Number(oh), Number(om)]
      let m = om + a
      let h = oh
      if (m >= 60) {
        m -= 60
        h += 1
      }
      return `${toTwoDigit(h)}:${toTwoDigit(m)}`
    }

    const TestTimelist = ['08:40', '10:20', '11:00']

    let testScheduleTxt = ''
    for (let i = 0; i < subjects.length; i++) {
      const { subject, duration } = subjects[i]
      testScheduleTxt = `${testScheduleTxt}${TestTimelist[i]}-${sumTime(
        TestTimelist[i],
        duration
      )}\n${subject} Test\n(${duration} 分鐘)\n\n`
    }

    const testTTEmbed = new MessageEmbed()
      .setAuthor('日期資訊 Date info', 'https://i.imgur.com/wMfgtoW.png?1')
      .setDescription(
        `━━━━━━━━━━━━━\n<t:${Math.round(
          JSDateForDay.getTime() / 1000
        )}:D> [${dayOfWeek}]\n上學期測驗周 (Day ${testWeekDay})\n\u2800`
      )
      .setColor('#ACE9A6')
      .setFooter(
        '簡 Jane',
        'https://cdn.discordapp.com/avatars/801354940265922608/597ed679b7bdcfd32b22e2149a6222ce.webp'
      )
      .addField(
        '測驗時段列表',
        testScheduleTxt.replace(/\n$/, '') + `━━━━━━━━━━━━━\n${foota[random]}`
      )
      .setTimestamp()

    return testTTEmbed
  }
}
