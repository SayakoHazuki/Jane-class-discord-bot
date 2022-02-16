const Discord = require('discord.js')
const Command = require('cmd')
const { printLog } = require('utils')
const Util = require('utils')

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
    if (message.author.id !== '690822196972486656') {
      args[1] = undefined
      args[2] = undefined
    }
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
      embeds: [
        new Period(args[2] || queryDate, 'ONLINE', next, args[1]).interface
      ]
    })
  }
}

const daysJson = require('./data/sd.json')
const timetableJson = require('./data/tt.json')
const lessonLinksJson = require('./data/classlink.json')
const classTimes = require('./data/classStartTime.json')
const classTimeFull = require('./data/classTimes.json')
const lessonArrangements = require('./data/lessonArrangements.json')

const divider = '━━━━━━━━━━━━━'

function getMonthFromString (mon) {
  return new Date(Date.parse(mon + ' 1, 2022')).getMonth() + 1
}

const restPeriods = require('./data/recessLunchTime.json')
function getRestSection (type, from, to, endRelativeTimestamp) {
  let typeName
  switch (type) {
    case 'RECESS':
      typeName = '小息'
      break
    case 'LUNCH':
      typeName = '午膳時段'
      break
    default:
      typeName = '休息'
  }

  return `現在是${typeName}\n(${from} - ${to})\n\n${typeName}將會在 ${endRelativeTimestamp} 結束\n${divider}\n`
}

class Period {
  constructor (
    dateToRead,
    timeOfSchool = 'ONLINE',
    next = false,
    overrideTime = undefined
  ) {
    this.next = next

    // ======= Class Properties =======
    this.embed = new Discord.MessageEmbed()

    this.cycleNumber = '1'
    this.cycleDay = 'A'
    this.oddCycle = false

    this.monthToRead = getMonthFromString(dateToRead.replace(/[0-9]/g, ''))
    this.dayNumberToRead = Number(dateToRead.replace(/[a-zA-Z]/g, '')) || 0

    // this.dayValueArray - Expected : ['Cycle','9','Day','Z','(星期X)']
    this.dayValueArray = daysJson[dateToRead]?.split(' ') ?? []

    this.discordTimestamp = ''
    this.dayOfWeek = '星期{}'
    this.dayDescription = 'Cycle {} Day {}'

    this.holiday = false

    this.rest = false
    this.restinfo = {}

    this.classesEnded = false
    this.classesEndedType = ''

    this.lessons = {}
    this.lessonsList = []

    this.nextPeriodFull = false
    this.nextPeriodNumber = false
    this.nowPeriodFull = ''
    this.nowPeriodNumber = ''

    this.showErrorEmbed = false

    // ==== End of Class Properties ====
    // =================================

    if (this.dayValueArray[4]) {
      if (isNaN(this.dayValueArray[1])) return (this.showErrorEmbed = true)

      this.cycleNumber = this.dayValueArray[1]
      this.oddCycle = Number(this.cycleNumber) % 2 === 1
    }

    // ========= Set var cycleDay =========

    this.cycleDay = this.dayValueArray[3] ?? 'holiday'

    if (this.cycleDay === 'holiday') return (this.holiday = true)
    this.holiday = false

    // ======= Split Lessons string =======

    const tj = timetableJson
    const cd = this.cycleDay
    const lessonsArrayA = tj['3A'][cd]?.split(' ')
    const lessonsArrayB = tj['3B'][cd]?.split(' ')
    const lessonsArrayC = tj['3C'][cd]?.split(' ')
    const lessonsArrayD = tj['3D'][cd]?.split(' ')

    const dateNow = new Date()
    const timeNow =
      overrideTime ||
      `${toTwoDigit(dateNow.getHours())}${toTwoDigit(dateNow.getMinutes())}`

    const addColon = t => {
      t = t?.toString?.()
      return t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2, 4)}` : t
    }

    for (const { from, to, type } of restPeriods) {
      if (timeNow >= from && timeNow <= to && !next) {
        this.rest = type
        this.restinfo = {
          from: addColon(from),
          to: addColon(to),
          endRelativeTimestamp: `${Util.getDiscordTimestamp(
            new Date(`${dateToRead} ${addColon(to)} ${dateNow.getFullYear()}`),
            'R'
          )}`
        }
        this.next = next = true
      }
    }

    const timeList =
      timeOfSchool in classTimes ? classTimes[timeOfSchool] : classTimes.NORMAL
    const timeListFull =
      timeOfSchool in classTimeFull
        ? classTimeFull[timeOfSchool]
        : classTimeFull.NORMAL

    let i = 0
    for (let time of timeList) {
      time = time.replace(':', '')

      if (sumTime(timeNow, 10) >= time && timeNow < time) next = true

      if (timeNow < time) {
        if (i === 0) next = true

        this.nowPeriodNumber = i - 1
        this.nextPeriodNumber = i
        this.nowPeriodFull = timeListFull[i - 1] || timeListFull
        this.nextPeriodFull = timeListFull[i] || false
        break
      }

      if ((i === 5 && next) || i === 6) {
        this.classesEnded = true
        this.classesEndedType = `${
          i === 5 && next
            ? timeNow <= timeList[6]
              ? 'L6InProgress'
              : 'AllEnded'
            : 'AllEnded'
        }`
        /*
          return (this.embed = new Discord.MessageEmbed()
            .setAuthor(`${next ? '下節課堂' : '本節課堂'}`)
            .setDescription(
              `${divider}\n${
                i === 5 && next
                  ? timeNow <= timeList[6]
                    ? '本節已是本日最後一節課堂'
                    : '本日課堂已全部完結 :tada:'
                  : '本日課堂已全部完結 :tada:'
              }`
            )
            .setColor('#ACE9A6'))
          */
      }
      i++
    }

    if (lessonsArrayA[5]) {
      let links = []

      this.lessonTimeFull = next ? this.nextPeriodFull : this.nowPeriodFull
      const periodNumber = next ? this.nextPeriodNumber : this.nowPeriodNumber
      const lessonA = lessonsArrayA[periodNumber]
      const lessonB = lessonsArrayB[periodNumber]
      const lessonC = lessonsArrayC[periodNumber]
      const lessonD = lessonsArrayD[periodNumber]

      this.lessons = { lessonA, lessonB, lessonC, lessonD }

      let mdLink = ''

      const lessonsArrays = [
        lessonsArrayA,
        lessonsArrayB,
        lessonsArrayC,
        lessonsArrayD
      ]
      const lessons = [lessonA, lessonB, lessonC, lessonD]
      const classes = ['3A', '3B', '3C', '3D']

      for (let i = 0; i < 4; i++) {
        let subj = lessons[i]

        // Special Subjects Handler
        switch (subj) {
          case 'MUS/DE':
            subj = this.oddCycle ? 'DE' : 'MUS'
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

        // Function to get readable subject name, used for PE/Speaking
        function srn () {
          return [
            subj === 'PE' ? 'PE(Boys)' : 'Speaking(ENG)',
            subj === 'PE' ? 'PE(Girls)' : 'Speaking(NET)'
          ]
        }

        switch (links.length) {
          case 1:
            if (links[0] === '' || !links[0]) {
              mdLink = `[找不到${classes[i]} ${subj}的課室連結]`
            } else {
              mdLink = `[按此進入 ${subj} 課室 (${
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
          default:
            undefined()
        }

        const LA_ = lessonArrangements
        const thePeriodNumber = next
          ? this.nextPeriodNumber
          : this.nowPeriodNumber

        if (dateToRead in LA_[classes[i]]) {
          for (const LA of LA_[classes[i]][dateToRead]) {
            if (LA.period === thePeriodNumber) {
              printLog('WARN', __filename, 'Lesson Arrangement detected.')
              printLog('WARN', __filename, `From ${LA.from} to ${LA.to}`)

              subj = `~~${LA.from}~~ **${LA.to}**`
              mdLink = `${LA.link}`
            }
          }
        }

        mdLink += `${i >= 3 ? `\n${divider}` : '\n\u2800'}`

        this.lessonsList.push({
          classId: classes[i],
          nextLesson: lessonsArrays[i][periodNumber + 1] ?? false,
          subject: subj,
          classroomMDLink: mdLink
        })
      }

      // Date for reading (timestamp)
      const JSDateForDay = new Date(
        `2022-${toTwoDigit(this.monthToRead)}-${toTwoDigit(
          this.dayNumberToRead
        )}T12:00:00`
      )

      this.discordTimestamp = `<t:${Math.round(
        JSDateForDay.getTime() / 1000
      )}:D>`

      this.dayOfWeek = `[${daysJson[dateToRead]
        .split('(')[1]
        .replace(/[()]/g, '') || ''}]`

      // dayDescription, e.g. Cycle 9 Day A
      this.dayDescription = `${daysJson[dateToRead].split('(')[0] ||
        daysJson[dateToRead]}`
    }
  }

  get interface () {
    const {
      next,
      discordTimestamp,
      dayOfWeek,
      dayDescription,
      nextPeriodNumber,
      nowPeriodNumber,
      lessonTimeFull,
      lessonsList,
      rest
    } = this

    let from, to, endRelativeTimestamp
    if (rest) {
      ;({ from, to, endRelativeTimestamp } = this.restinfo)
    }

    this.embed
      .setAuthor(`${next ? '下一節課堂' : '本節課堂'}`)
      .setDescription(
        `${divider}\n${discordTimestamp} ${dayOfWeek}\n${dayDescription}\n\n${
          rest ? getRestSection(rest, from, to, endRelativeTimestamp) : ''
        }${next ? '下節課堂: ' : '本節課堂: '}第 ${
          next ? nextPeriodNumber + 1 : nowPeriodNumber + 1
        } 節 (${lessonTimeFull})\u2800`
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
    }

    return this.embed
  }
}

// Force two digits

function toTwoDigit (deg) {
  return ('0' + deg).slice(-2)
}

function sumTime (a, b) {
  a = a.toString()
  b = b.toString()
  const sum = (Number(a) + Number(b)).toString()
  const result =
    sum.slice(2, 4) > 60
      ? `${toTwoDigit(Number(sum.slice(0, 2)) + 1)}${toTwoDigit(
          Number(sum.slice(2, 4)) - 60
        )}`
      : sum
  return result
}
