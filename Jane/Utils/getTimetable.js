const { MessageEmbed } = require('discord.js')
const daysJson = require('../commands/info/data/sd.json')
const timetableJson = require('../commands/info/data/tt.json')
const lessonLinksJson = require('../commands/info/data/classlink.json')
const classTimes = require('../commands/info/data/classTimes.json')

const fs = require('fs')
const path = require('path')

const terminal = require('./terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

const divider = '━━━━━━━━━━━━━'

function getMonthFromString (mon) {
  return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1
}

module.exports = class TimetableEmbed {
  constructor (dateToRead, timeOfSchool = 'ONLINE', showLinks = true, sClass) {
    if (dateToRead === '04Mar') timeOfSchool = '04MAR'
    // Return if unknown class
    if (!['3A', '3B', '3C', '3D'].includes(sClass)) return

    // Var
    let cycleNumber, cycleDay, lessonsString, oddCycle

    const dayValueArray = daysJson[dateToRead].split(' ')
    if (!dayValueArray) {
      return printLog('info', __filename, 'dayValueArray is undefined')
    }

    // dayValueArray - Expected : ['Cycle','9','Day','Z','(星期X)']

    if (dayValueArray[4]) {
      cycleNumber = dayValueArray[1]
      if (isNaN(cycleNumber)) return

      oddCycle = Number(cycleNumber) % 2 === 1
      printLog(
        'info',
        __filename,
        `Cycle Number: ${cycleNumber}, odd: ${oddCycle}`
      )
    }

    const monthToRead = getMonthFromString(dateToRead.replace(/[0-9]/g, ''))
    const dayNumberToRead = dateToRead.replace(/[a-zA-Z]/g, '')

    // ========= Set var cycleDay =========

    if (dayValueArray[3]) {
      if (dayValueArray[0].includes('測驗周')) {
        const testsEmbed = new TestEmbed(
          dayValueArray[2],
          new Date(
            `2021-${toTwoDigit(monthToRead)}-${toTwoDigit(
              dayNumberToRead
            )}T12:00:00`
          ),
          daysJson[dateToRead].split('(')[1].replace(/[()]/g, '') || ''
        )
        this.embed = testsEmbed
        return
      } else {
        cycleDay = dayValueArray[3]
      }
    } else {
      cycleDay = 'holiday'
      printLog('info', __filename, 'Holiday detected')
    }

    // ======== Unknown intention ========

    if (cycleDay.includes('TestDay')) {
      lessonsString = timetableJson.test[`Day${dayValueArray[3]}`]
    } else {
      lessonsString = timetableJson[sClass][cycleDay]
    }

    // ======= Split Lessons string =======

    const lessonsArray = lessonsString.split(' ')

    if (lessonsArray[5]) {
      let timetableReadable
      let embedDesc = ''

      const timeList =
        timeOfSchool in classTimes
          ? classTimes[timeOfSchool]
          : classTimes.NORMAL

      for (let i = 0; i < 6; i++) {
        let mdLink = ''
        const numberEmojis = [
          ':one:',
          ':two:',
          ':three:',
          ':four:',
          ':five:',
          ':six:'
        ]
        const lessonTime = timeOfSchool
          ? timeList[i] + '\n'
          : numberEmojis[i] + ' '
        let subj = lessonsArray[i]
        let links
        switch (subj) {
          case 'MUS/DE':
            subj = oddCycle ? 'DE' : 'MUS'
            break
          case 'PE':
            links = [
              lessonLinksJson[sClass]['PE-boys'],
              lessonLinksJson[sClass]['PE-girls']
            ]
            break
          case 'SPEAK':
            links = [lessonLinksJson[sClass].ENG, lessonLinksJson[sClass].NET]
        }
        if (!['PE', 'SPEAK'].includes(subj)) {
          links = [lessonLinksJson[sClass][subj]]
        }

        // for lessons with 2 links (PE/SPEAK)
        if (links.length === 2) {
          const subjReadableName1 = subj === 'PE' ? 'PE(Boys)' : 'Speaking(ENG)'
          const subjReadableName2 =
            subj === 'PE' ? 'PE(Girls)' : 'Speaking(NET)'

          mdLink = `${
            links[0] === ''
              ? `[找不到${sClass} ${subjReadableName1}的課室連結]`
              : `[按此進入${subjReadableName1}課室](${links[0]})`
          } / ${
            links[1] === ''
              ? `[找不到${sClass} ${subjReadableName2}的課室連結]`
              : `[按此進入${subjReadableName2}課室](${links[1]})`
          }\n`
        }

        // for other lessons
        if (links.length === 1) {
          if (links[0] === '' || !links[0]) {
            mdLink = `[找不到${sClass} ${subj}的課室連結]\n`
          } else {
            mdLink = `[按此進入 ${subj} 課室 (${
              links[0].includes('zoom') ? 'Zoom' : 'Meet'
            })](${links[0]})\n`
          }
        }

        let displayLink = showLinks ? mdLink : ''

        const lessonArrangements = JSON.parse(
          fs.readFileSync(
            path.join(
              __dirname,
              '../commands/info/data/lessonArrangements.json'
            ),
            'utf8'
          )
        )
        if (dateToRead in lessonArrangements[sClass]) {
          for (const lessonArrangement of lessonArrangements[sClass][
            dateToRead
          ]) {
            printLog('WARN', __filename, 'Lesson Arrangement detected.')
            if (lessonArrangement.period === i) {
              subj = `~~${lessonArrangement.from}~~ **${lessonArrangement.to}**`
              displayLink = `[按此進入 ${lessonArrangement.to} 課室](${lessonArrangement.link})\n`
            }
          }
        }

        embedDesc += `${lessonTime}${subj} ${displayLink}\n`
        if (i === 5) timetableReadable = embedDesc
      }

      // Footer
      const footerList = [
        '請記得準備所需教材喔',
        '請記得檢查功課是不是做完了喔',
        '明天也要加油喔'
      ]
      const random = Math.floor(Math.random() * footerList.length)

      // Date for reading (timestamp)
      const JSDateForDay = new Date(
        `2021-${toTwoDigit(monthToRead)}-${toTwoDigit(
          dayNumberToRead
        )}T12:00:00`
      )
      const discordTimestamp = `<t:${Math.round(
        JSDateForDay.getTime() / 1000
      )}:D>`
      const dayOfWeek = `[${daysJson[dateToRead]
        .split('(')[1]
        .replace(/[()]/g, '') || ''}]`

      // dayDescription, e.g. Cycle 9 Day A
      const dayDescription = `${daysJson[dateToRead].split('(')[0] ||
        daysJson[dateToRead]}`

      printLog(
        'info',
        __filename,
        `2021-${monthToRead}-${dayNumberToRead}T12:00:00`
      )
      printLog('info', __filename, JSDateForDay.getTime())

      const timetableEmbed = new MessageEmbed()
        .setAuthor(
          `[${sClass}] 日期資訊 Date info`,
          'https://i.imgur.com/wMfgtoW.png?1'
        )
        .setDescription(
          `${divider}\n${discordTimestamp} ${dayOfWeek}\n${dayDescription}\n\u2800`
        )
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
        )
        .addField(
          '課堂列表',
          timetableReadable + `${divider}\n${footerList[random]}`
        )
        .setTimestamp()

      this.embed = timetableEmbed
    }

    // For Holidays
    if (!lessonsArray[5] && !dayValueArray[0].includes('測驗周')) {
      const JSDateForDay = new Date(
        `2021-${toTwoDigit(monthToRead)}-${toTwoDigit(
          dayNumberToRead
        )}T12:00:00`
      )
      const discordTimestamp = `<t:${Math.round(
        JSDateForDay.getTime() / 1000
      )}:D>`

      const footerList = [
        '趁著難得的假期好好放鬆一下吧',
        '請好好享受假期吧',
        '最近真是辛苦了，休閒的度過假期吧',
        '會有特別的假期安排嗎？'
      ]
      const random = Math.floor(Math.random() * footerList.length)

      const holidayEmbed = new MessageEmbed()
        .setAuthor('日期資訊 Date info', 'https://i.imgur.com/wMfgtoW.png?1')
        .setDescription(`${discordTimestamp}是假期喔 ${footerList[random]}`)
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
        )
        .setTimestamp()

      this.embed = holidayEmbed
    }
  }
}

// Force two digits

function toTwoDigit (deg) {
  return ('0' + deg).slice(-2)
}

// For Testweek
class TestEmbed {
  constructor (testWeekDay, JSDateForDay, dayOfWeek) {
    const subjects = timetableJson.tests[testWeekDay - 1]
    const footerList = [
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
    const random = Math.floor(Math.random() * footerList.length)

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
        'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
      )
      .addField(
        '測驗時段列表',
        testScheduleTxt.replace(/\n$/, '') + `${divider}\n${footerList[random]}`
      )
      .setTimestamp()

    return testTTEmbed
  }
}
