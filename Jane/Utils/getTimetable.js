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
  constructor (dateToRead, timeOfSchool = false, showLinks = false, sClass) {
    if (
      sClass !== '3A' &&
      sClass !== '3B' &&
      sClass !== '3C' &&
      sClass !== '3D'
    ) {
      return
    }
    showLinks = false
    let cycleNum, cycleDay, lessonsString, oddCycle
    const dayDescArray = daysJson[dateToRead].split(' ')
    if (!dayDescArray) {
      return printLog('info', __filename, 'dayDescArray is undefined')
    }
    if (dayDescArray[4]) {
      cycleNum = dayDescArray[1]
      printLog('info', __filename, 'let cycle = ' + cycleNum)
      if (Number(cycleNum) % 2 === 0) {
        oddCycle = 'false'
      } else if (Number(cycleNum) % 2 === 1) {
        oddCycle = 'true'
      } else {
        return 'Error'
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
        const subj = lessonsArray[i]
        const fl = lessonLinksJson[subj] || 'no'
        if (fl.includes('*meet*') || fl.includes('*zoom*')) {
          mdLink = `[按此進入${fl.split('*')[1]}](http${fl.split('http')[1]})\n`
        }

        if (fl.includes('*no*')) {
          mdLink = fl.split('*')[2] + '\n'
        }

        if (fl.includes('*gc*')) {
          mdLink = `[按此到 GC 查看課堂連結](http${fl.split('http')[1]})\n`
        }

        if (fl === 'no') mdLink = ''
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
