const Discord = require('discord.js')
const Command = require('cmd')
const { printLog } = require('utils')
const Util = require('utils')

let lessonLinksJson

module.exports = class lessonCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lesson',
      aliases: ['class', 'lsn'],
      category: 'info',
      description: 'See the current/next lesson',
      usage: "lesson <'next'|'now'>",
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
      embeds: [new Period(queryDate, 'ONLINE', next).interface]
    })
  }
}

const daysJson = require('./data/sd.json')
const timetableJson = require('./data/tt.json')
const classTimes = require('./data/classStartTime.json')
const classTimeFull = require('./data/classTimes.json')
const lessonArrangements = require('./data/lessonArrangements.json')

const divider = '━━━━━━━━━━━━━'

function getMonthFromString (mon) {
  return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1
}

const restPeriods = require('./data/recessLunchTime.json')
const restEmbeds = {
  RECESS: new Discord.MessageEmbed()
    .setAuthor('本節時段')
    .setDescription(
      `${divider}\n${Util.getDiscordTimestamp(
        new Date(),
        'f'
      )}\n現在是 __小息時段__\n\n如果想知道下節課堂,\n請使用 \`-lesson next\` 指令\n${divider}`
    )
    .setColor('#ACE9A6')
    .setFooter(
      '簡 Jane',
      'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
    )
    .setTimestamp(),
  LUNCH: new Discord.MessageEmbed()
    .setAuthor('本節時段')
    .setDescription(
      `${divider}\n${Util.getDiscordTimestamp(
        new Date(),
        'f'
      )}\n現在是 __午膳時段__\n\n如果想知道下節課堂, 請使用 \`-lesson next\` 指令\n${divider}`
    )
    .setColor('#ACE9A6')
    .setFooter(
      '簡 Jane',
      'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
    )
    .setTimestamp()
}

class Period {
  constructor (dateToRead, timeOfSchool = 'ONLINE') {
    lessonLinksJson = require('./data/classlink.json')

    this.next = false

    // ======= Class Properties =======
    this.embed = new Discord.MessageEmbed()
    // Var
    let cycleNumber, cycleDay, oddCycle

    const dayValueArray = daysJson[dateToRead].split(' ')
    if (!dayValueArray) {
      return printLog('info', __filename, 'dayValueArray is undefined')
    }

    this.lessons = {}
    this.lessonsList = []
    this.lessonTimeFull = ''

    this.periodNumber = 0
    this.isShowingNext = false

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

    // ======== Time now, date now ========

    const dateNow = new Date()
    const timeNow = `${toTwoDigit(dateNow.getHours())}${toTwoDigit(
      dateNow.getMinutes()
    )}`
    const time15MinLater = sumTime(timeNow, 15)
    Util.printLog('INFO', __filename, `Time 15Min later = ${time15MinLater}`)
    Util.printLog('INFO', __filename, `Time Now = ${timeNow}`)

    // ======= If is in rest period =======

    const addColon = t => {
      t = t?.toString?.()
      return t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2, 4)}` : t
    }

    for (const { from, to, type } of restPeriods) {
      if (timeNow >= from && timeNow <= to) {
        this.rest = type
        this.restinfo = {
          from: addColon(from),
          to: addColon(to),
          endRelativeTimestamp: `${Util.getDiscordTimestamp(
            new Date(`${dateToRead} ${addColon(to)} ${dateNow.getFullYear()}`),
            'R'
          )}`
        }
        this.next = true
      }
    }

    // timeList : classes starting time
    // timeListFull : For human reading, full time
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

      if (time15MinLater < time) {
        // if time 15 later haven't passed the
        // next period's starting time
        if (i === 0) {
          i++
          this.isBeforeSchool = true
        }
        this.periodNumber = i - 1
        break
      }

      if (i === 6) {
        this.classesEnded = true
        this.classesEndedType =
          timeNow <= timeList[6].replace(':', '') ? 'L6InProgress' : 'AllEnded'
      }
      i++
    }

    if (!(this.classesEnded || this.isBeforeSchool)) {
      this.isShowingNext =
        timeNow < timeList[this.periodNumber].replace(':', '')
    }

    this.lessonTimeFull = timeListFull[this.periodNumber]

    if (lessonsArrayA[5]) {
      let mdLink = ''
      let links = []

      const lessonsArrays = [
        lessonsArrayA,
        lessonsArrayB,
        lessonsArrayC,
        lessonsArrayD
      ]

      const classes = ['3A', '3B', '3C', '3D']
      for (let i = 0; i < 4; i++) {
        let lessonSubject = lessonsArrays[i][this.periodNumber] ?? 'Unknown'
        const nextLessonSubject =
          lessonsArrays[i][this.periodNumber + 1] ?? false

        // Special Subjects Handler
        switch (lessonSubject) {
          case 'MUS/DE':
            lessonSubject = this.oddCycle ? 'DE' : 'MUS'
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

        if (!['PE', 'SPEAK'].includes(lessonSubject)) {
          links = [lessonLinksJson[classes[i]][lessonSubject]]
        }

        // Function to get readable subject name, used for PE/Speaking
        function srn () {
          return [
            lessonSubject === 'PE' ? 'PE(Boys)' : 'Speaking(ENG)',
            lessonSubject === 'PE' ? 'PE(Girls)' : 'Speaking(NET)'
          ]
        }

        switch (links.length) {
          case 1:
            if (links[0] === '' || !links[0]) {
              mdLink = `[找不到${classes[i]} ${lessonSubject}的課室連結]`
            } else {
              mdLink = `[按此進入 ${lessonSubject} 課室 (${
                links[0].includes('zoom') ? 'Zoom' : 'Meet'
              })](${links[0]})`
            }
            break
          case 2:
            mdLink = `${
              links[0] === ''
                ? `[找不到${classes[i]} ${srn()[0]}的課室連結]`
                : `[按此進入${srn()[0]}課室](${links[0]})`
            }\n${
              links[1] === ''
                ? `[找不到${classes[i]} ${srn()[1]}的課室連結]`
                : `[按此進入${srn()[1]}課室](${links[1]})`
            }`
            break
          //  default:
          //    undefined()
        }

        const LA_ = lessonArrangements

        if (dateToRead in LA_[classes[i]]) {
          for (const LA of LA_[classes[i]][dateToRead]) {
            if (LA.period === this.periodNumber) {
              printLog('WARN', __filename, 'Lesson Arrangement detected.')
              printLog('WARN', __filename, `From ${LA.from} to ${LA.to}`)

              lessonSubject = `~~${LA.from}~~ **${LA.to}**`
              mdLink = `${LA.link}`
            }
          }
        }

        mdLink += `${i >= 3 ? `\n${divider}` : '\n\u2800'}`

        this.lessonsList.push({
          classId: classes[i],
          nextLesson: nextLessonSubject,
          subject: lessonSubject,
          classroomMDLink: mdLink
        })
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
    }
  }

  get interface () {
    const {
      discordTimestamp,
      dayOfWeek,
      dayDescription,
      periodNumber,
      lessonTimeFull,
      lessonsList,
      rest
    } = this

    Util.printLog('INFO', __filename, 'Generating Lesson Interface')
    Util.printLog(
      'INFO',
      __filename,
      `Period No. ${periodNumber}, period time ${lessonTimeFull}`
    )
    Util.printLog(
      'INFO',
      __filename,
      `Showing next lesson: ${this.isShowingNext}`
    )

    let from, to, endRelativeTimestamp
    if (rest) {
      ;({ from, to, endRelativeTimestamp } = this.restinfo)
    }

    this.embed
      .setAuthor(`${this.isShowingNext ? '下一節課堂' : '本節課堂'}`)
      .setDescription(
        `${divider}\n${discordTimestamp} ${dayOfWeek}\n${dayDescription}\n\n${
          rest ? getRestSection(rest, from, to, endRelativeTimestamp) : ''
        }${this.isShowingNext ? '下節課堂: ' : '本節課堂: '}第 ${periodNumber +
          1} 節 (${lessonTimeFull})\u2800`
      )
      .setColor('#ACE9A6')
      .setFooter(
        '簡 Jane',
        'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
      )
      .setTimestamp()

    for (const {
      classId,
      nextLesson,
      subject,
      classroomMDLink
    } of lessonsList) {
      this.embed.addField(
        `${classId || '??'} - ${subject || '找不到科目'} ${
          nextLesson ? `(下一節: ${nextLesson})` : ''
        }`,
        `${classroomMDLink}`
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

      this.embed.addField('\u2800', divider)
    }
  }
}

// Force two digits

function toTwoDigit (deg) {
  return ('0' + deg).slice(-2)
}
