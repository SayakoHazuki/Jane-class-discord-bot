const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
module.exports = class addClassLinkCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'setClassLink',
      aliases: ['addClassLink', 'acl', 'al', 'scl', 'sl'],
      category: 'tools',
      description: 'Set Online Class Link',
      usage: 'sl <class>,<subject>,<link> [<class>,<subject>,<link> ...]',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const addedLinksList = []
    const originalFileContent = fs.readFileSync(
      path.join(__dirname, '../info/data/classlink.json')
    )
    const originalJSON = JSON.parse(originalFileContent)
    let optionsArray
    for (const arg of args) {
      optionsArray = arg.split(',')

      const options = {
        class: optionsArray[0],
        subj: optionsArray[1],
        link: optionsArray[2]
      }
      if (!['3A', '3B', '3C', '3D'].includes(options.class.toUpperCase())) {
        return message.reply(
          `Unknown class : ${options.class}, Expected '3A/3B/3C/3D'`
        )
      }
      if (options.subj in originalJSON[options.class]) {
        originalJSON[options.class][options.subj] = options.link
      } else {
        return message.reply(
          `Unknown subject: ${options.subj}, Expected:\nCHIN/ENG/MATH/BIO/CHEM/PHY/HIST/CHIS/\nGEOG/LS/PTH/MUS/DE/VA/RS/IT/NET/CTP/ASS/\nPE-boys/PE-girls`
        )
      }

      addedLinksList.push(
        `${options.class} ${options.subj}: \`${options.link}\``
      )
    }

    const newData = JSON.stringify(originalJSON, null, '\t')
    fs.writeFile(
      path.join(__dirname, '../info/data/classlink.json'),
      newData,
      err => {
        if (err) throw err
        message.reply(
          `已新增連結: \n${addedLinksList.join(
            '\n'
          )},\n2秒後將重啟以更新連接資料`
        )
        setTimeout(function () {
          exec('pm2 restart jane', (error, stdout, stderr) => {
            if (error) {
              Util.handleErr(error)
              message.reply(`PM2 error: ${error.message}`)
              return
            }
            if (stderr) {
              Util.handleErr(stderr)
              message.reply(`stderr: ${stderr}`)
            }
          })
        }, 1500)
        logger.info(`已新增連結: \n${addedLinksList.join('\n')}`)
      }
    )
  }
}
