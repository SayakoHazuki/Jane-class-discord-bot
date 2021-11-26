const Discord = require('discord.js')
const Command = require('cmd')
const Util = require('utils')

let pushList

module.exports = class HomeworkCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'homework',
      aliases: ['hw', 'classwork', 'gc', 'todo', 'to-do'],
      category: '資訊',
      description: '顯示Google classroom 的 To-do (不久後deadline的功課)',
      usage: 'homework',
      minArgs: 0,
      maxArgs: 0
    })
  }

  async run (message, args) {
    if (message) return message.reply('本指令暫時無法使用')
    const panel = await message.reply(
      Util.InfoEmbed(message, '正在載入 (1/3)')
    )
    const fs = require('fs')
    const readline = require('readline')
    const { google } = require('googleapis')

    // If modifying these scopes, delete token.json.
    const SCOPES = [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
      'https://www.googleapis.com/auth/classroom.push-notifications',
      'https://www.googleapis.com/auth/classroom.announcements.readonly'
    ]
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'secrets/token.json'

    // Load client secrets from a local file.
    fs.readFile('secrets/credentials.json', (err, content) => {
      if (err) {
        return Util.printLog('err', __filename, 'Error loading client scs file: ', err)
      }
      // Authorize a client with credentials, then call the Google Classroom API.
      authorize(JSON.parse(content), listCourses)
    })

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize (credentials, callback) {
      const { clientSecret, clientID, redirectURIs } = credentials.installed
      const oAuth2Client = new google.auth.OAuth2(
        clientID,
        clientSecret,
        redirectURIs[0]
      )

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
      })
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getNewToken (oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      Util.printLog('info', __filename, 'Authorize this app by visiting this url: ' + authUrl)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Enter the code from that page here: ', code => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err)
          oAuth2Client.setCredentials(token)
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
            if (err) return console.error(err)
            Util.printLog('info', __filename, 'Token stored to ' + TOKEN_PATH)
          })
          callback(oAuth2Client)
        })
      })
    }

    /**
     * Lists the first 10 courses the user has access to.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async function listCourses (auth) {
      const classroom = google.classroom({
        version: 'v1',
        auth
      })
      classroom.courses.list(
        {
          pageSize: 30
        },
        (err, res) => {
          if (err) return console.error(err)
          const courses = res.data.courses
          const assignmentList = []
          if (courses && courses.length) {
            panel.edit(Util.InfoEmbed(message, '正在載入(2/3)'))
            for (let ic = 0; ic < courses.length; ic++) {
              const course = courses[ic]
              const test =
                course.id === 170867855947 ||
                course.id === 130616469628 ||
                course.id === 42508842388 ||
                course.id === 51810306111 ||
                course.id === 52384109649 ||
                course.id === 52861544356 ||
                course.id === 55071512258 ||
                course.id === 52916791280 ||
                course.id === 248313081907 ||
                course.id === 248308470104 ||
                course.id === 248318849685 ||
                course.id === 248307241587 ||
                course.id === 248345520018 ||
                course.id === 248313489488
              Util.printLog(
                'info',
                __filename,
                `processing Course ${course.name}\n(passes test? -> ${test})`
              )
              if (test) continue
              function process () {
                return new Promise(resolve => {
                  classroom.courses.courseWork.list(
                    {
                      courseId: course.id,
                      orderBy: 'dueDate',
                      pageSize: 5
                    },
                    (err, res) => {
                      // const assignedClass = course.name;
                      if (err) {
                        return console.error(
                          'The API returned an error: ' + err
                        )
                      }
                      const works = res.data.courseWork
                      processWork(works, panel, assignmentList, message)
                      /*
                        if (works && works.length) {
                          for (let i = 0; i < works.length; i++) {
                            Util.printLog('info', __filename,
                              `processing work ${i + 1} of course ${ic + 1}`
                            );
                            let assignment = works[i];
                            const { year, month, day } = assignment.dueDate || {
                              year: "2020",
                              month: "01",
                              day: "01",
                            }; //1995-12-17T03:24:00
                            const [yyyy, mm, dd] = [
                              year,
                              twoDigit(month),
                              twoDigit(day),
                            ];
                            const [h, m] = [
                              twoDigit(
                                assignment.dueTime?.hours
                                  ? assignment.dueTime.hours + 8
                                  : 0
                              ),
                              twoDigit(
                                assignment.dueTime?.minutes
                                  ? assignment.dueTime.minutes
                                  : 0
                              ),
                            ];
                            if (!year || !month || !day) return;
                            const dueJSDate = new Date(
                              `${yyyy}-${mm}-${dd}T${h}:${m}:00`
                            );
                            const now = new Date();
                            if (dueJSDate < now) return;
                            assignmentList.push(
                              `Due : ${dd}/${mm}/${yyyy} ${h}:${m}\n${
                                assignment.title || "Unknown title"
                              }\n`
                            );
                            Util.printLog("warn",`ic = ${ic}; courses.length = ${courses.length}`)
                            if(ic - 1 === courses.length) resolve()
                          }
                        } */
                    }
                  )
                })
              }
              async function awaitForProcess () {
                Util.printLog('info', __filename, 'calling for process, ic = ', ic)
                await process()
                Util.printLog('info', __filename, 'The code has been called, ic = ', ic)
              }
              awaitForProcess()
            }
          }
        }
      )
    }
  }
}

let intSet
function processWork (works, panel, aList, msg) {
  if (!intSet) {
    panel.edit(Util.InfoEmbed(msg, '正在整理(3/3)'))
    intSet = true
    setTimeout(function () {
      updatePanel(panel)
    }, 2500)
  }
  if (works && works.length) {
    for (let i = 0; i < works.length; i++) {
      // Util.printLog('info', __filename, `processing work ${i + 1} of course ${ic + 1}`);
      const assignment = works[i]
      const { year, month, day } = assignment.dueDate || {
        year: '2020',
        month: '01',
        day: '01'
      } // 1995-12-17T03:24:00
      const [yyyy, mm, dd] = [
        year,
        Util.formatNumDigit(month),
        Util.formatNumDigit(day)
      ]
      const [h, m] = [
        Util.formatNumDigit(
          assignment.dueTime?.hours ? assignment.dueTime.hours + 8 : 0
        ),
        Util.formatNumDigit(
          assignment.dueTime?.minutes ? assignment.dueTime.minutes : 0
        )
      ]
      if (!year || !month || !day) return
      const dueJSDate = new Date(`${yyyy}-${mm}-${dd}T${h}:${m}:00`)
      const now = new Date()
      const hrdiff = Math.abs(dueJSDate - now) / 36e5
      const daydiff = hrdiff > 48 ? Math.round(Math.abs(hrdiff / 24)) : false
      const roundedHrDiff = Math.round(hrdiff * 10) / 10
      if (dueJSDate < now) return
      aList.push(
        `Due : ${yyyy}-${mm}-${dd} ${h}:${m} (${
          daydiff ? `${daydiff}日後` : `${roundedHrDiff}小時後`
        })\n${assignment.title || 'Unknown title'}\n`
      )
      // Util.printLog("warn", __filename, `ic = ${ic}; courses.length = ${courses.length}`);
      // if (ic - 1 === courses.length) resolve();
    }
  }
  pushList = aList
}

function updatePanel (panel) {
  intSet = false
  pushList.sort()
  const embed = new Discord.MessageEmbed()
    .setTitle('Assignments')
    .setDescription(pushList.join('\n'))
    .setColor('#8EC0D8')
  panel.edit('', embed)
}
