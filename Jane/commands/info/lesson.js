const Discord = require('discord.js')
const Command = require('cmd')
const { printLog } = require('utils')

module.exports = class lessonCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lesson',
      aliases: ['class', 'lsn'],
      category: 'info',
      description: 'See the current/next lesson',
      usage: "lesson <'next'|'now'|Number:Lesson#>",
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const queryDate = `${new Date().toLocaleString('en-us', {
      day: '2-digit'
    })}${new Date().toLocaleString('en-us', {
      month: 'short'
    })}`
    let next = false
    if (args[0]) {
      if (args[0].toUpperCase() === 'NEXT') next = true
    }
    message.reply({
      embeds: [new LessonEmbed(queryDate, 'ONLINE', next).embed]
    })
  }
}

const daysJson = require('./data/sd.json')
const timetableJson = require('./data/tt.json')
const lessonLinksJson = require('./data/classlink.json')
const classTimes = require('./data/classStartTime.json')
const classTimeFull = require('./data/classTimes.json')

const divider = '━━━━━━━━━━━━━'

function getMonthFromString (mon) {
  return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1
}

class LessonEmbed {
  constructor (dateToRead, timeOfSchool = 'ONLINE', next = false) {
    this.embed = new Discord.MessageEmbed()
    // Var
    let cycleNumber, cycleDay, oddCycle

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
      cycleDay = dayValueArray[3]
    } else {
      cycleDay = 'holiday'
      printLog('info', __filename, 'Holiday detected')
    }

    // For Holidays
    if (cycleDay === 'holiday') {
      const footerList = [
        '趁著難得的假期好好放鬆一下吧',
        '請好好享受假期吧',
        '最近真是辛苦了，休閒的度過假期吧',
        '會有特別的假期安排嗎？'
      ]
      const random = Math.floor(Math.random() * footerList.length)

      this.embed
        .setAuthor(next ? '下一節課堂' : '本節課堂')
        .setDescription(`今天是假期喔! ${footerList[random]}`)
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
        )
        .setTimestamp()
      return
    }

    const lessonsStringA = timetableJson['3A'][cycleDay]
    const lessonsStringB = timetableJson['3B'][cycleDay]
    const lessonsStringC = timetableJson['3C'][cycleDay]
    const lessonsStringD = timetableJson['3D'][cycleDay]

    // ======= Split Lessons string =======

    const lessonsArrayA = lessonsStringA.split(' ')
    const lessonsArrayB = lessonsStringB.split(' ')
    const lessonsArrayC = lessonsStringC.split(' ')
    const lessonsArrayD = lessonsStringD.split(' ')

    const dateNow = new Date()
    const timeNow = `${toTwoDigit(dateNow.getHours())}${toTwoDigit(
      dateNow.getMinutes()
    )}`

    const timeList =
      timeOfSchool in classTimes ? classTimes[timeOfSchool] : classTimes.NORMAL

    const timeListFull =
      timeOfSchool in classTimeFull
        ? classTimeFull[timeOfSchool]
        : classTimeFull.NORMAL

    let nowPeriodNumber, nextPeriodNumber, nowPeriodFull, nextPeriodFull
    let i = 0
    for (let time of timeList) {
      time = time.replace(':', '')
      printLog(
        'WARN',
        __filename,
        `Time now:${timeNow}, Next period:${time}, ${timeNow <= time}`
      )

      if (timeNow <= time) {
        if (i === 0) next = true
        nowPeriodNumber = i - 1
        nextPeriodNumber = i
        nowPeriodFull = timeListFull[i - 1] || timeListFull
        nextPeriodFull = timeListFull[i] || false
        break
      }

      if ((i === 5 && next) || i === 6) {
        this.embed = new Discord.MessageEmbed()
          .setAuthor(`${next ? '下節課堂' : '本節課堂'}`)
          .setDescription(
            `${divider}\n${
              next ? '本節已是本日最後一節課堂' : '本日課堂已全部完結 :tada:'
            }`
          )
          .setColor('#ACE9A6')
        return
      }
      i++
    }

    if (lessonsArrayA[5]) {
      let links = []

      const lessonA = lessonsArrayA[next ? nextPeriodNumber : nowPeriodNumber]
      const lessonB = lessonsArrayB[next ? nextPeriodNumber : nowPeriodNumber]
      const lessonC = lessonsArrayC[next ? nextPeriodNumber : nowPeriodNumber]
      const lessonD = lessonsArrayD[next ? nextPeriodNumber : nowPeriodNumber]

      let mdLink = ''
      const lessonTimeFull = next ? nextPeriodFull : nowPeriodFull
      const lessons = [lessonA, lessonB, lessonC, lessonD]
      const classes = ['3A', '3B', '3C', '3D']
      for (let i = 0; i < 4; i++) {
        let subj = lessons[i]

        switch (subj) {
          case 'MUS/DE':
            subj = oddCycle ? 'DE' : 'MUS'
            break
          case 'PE':
            links = [
              lessonLinksJson[classes[i]]['PE-boys'],
              lessonLinksJson[classes[i]]['PE-girls']
            ]
            break
          case 'SPEAK':
            links = [
              lessonLinksJson[classes[i]].ENG,
              lessonLinksJson[classes[i]].NET
            ]
        }
        if (!['PE', 'SPEAK'].includes(subj)) {
          links = [lessonLinksJson[classes[i]][subj]]
        }

        // for lessons with 2 links (PE/SPEAK)
        if (links.length === 2) {
          const subjReadableName1 = subj === 'PE' ? 'PE(Boys)' : 'Speaking(ENG)'
          const subjReadableName2 =
            subj === 'PE' ? 'PE(Girls)' : 'Speaking(NET)'

          mdLink = `${
            links[0] === ''
              ? `[找不到${classes[i]} ${subjReadableName1}的課室連結]`
              : `[按此進入${subjReadableName1}課室](${links[0]})`
          }\n${
            links[1] === ''
              ? `[找不到${classes[i]} ${subjReadableName2}的課室連結]`
              : `[按此進入${subjReadableName2}課室](${links[1]})`
          }\n`
        }

        // for other lessons
        if (links.length === 1) {
          if (links[0] === '' || !links[0]) {
            mdLink = `[找不到${classes[i]} ${subj}的課室連結]\n`
          } else {
            mdLink = `[按此進入 ${subj} 課室 (${
              links[0].includes('zoom') ? 'Zoom' : 'Meet'
            })](${links[0]})\n`
          }
        }

        this.embed.addField(`${classes[i]} - ${subj}`, `${mdLink}** **`)
      }

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

      this.embed
        .setAuthor(`${next ? '下一節課堂' : '本節課堂'}`)
        .setDescription(
          `${divider}\n${discordTimestamp} ${dayOfWeek}\n${dayDescription}\n\n${
            next ? '下節課堂: ' : '本節課堂: '
          }第 ${
            next ? nextPeriodNumber + 1 : nowPeriodNumber + 1
          } 節 (${lessonTimeFull})\u2800`
        )
        .setColor('#ACE9A6')
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
        )
        .setTimestamp()
    }
  }
}

// Force two digits

function toTwoDigit (deg) {
  return ('0' + deg).slice(-2)
}
