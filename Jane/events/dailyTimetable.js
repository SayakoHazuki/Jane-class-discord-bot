const Evt = require('../core/e')
// const Util = require('utils')

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'ready')
  }

  async run () {
    /*
    const client = this.client
    const done = false
    Util.printLog('info', __filename, done)
    const channel = client.channels.cache.get('833615147309334546')
    async function checktime () {
      const doffset = +8
      const d = new Date(new Date().getTime() + doffset * 3600 * 1000)
      const preh = d.getUTCHours()
      const h = ('0' + preh).slice(-2)
      const min = ('0' + d.getMinutes()).slice(-2)
      const time = h.toString() + min
      const target = '1800'
      if (time === target && done === false) {
        try {
          const offset = client.timezoneOffset

          const dateWithOffset = new Date(
            new Date().getTime() + offset * 3600 * 1000
          )
            .toUTCString()
            .replace(/ GMT$/, '')
          const dateWithOffsetArray = dateWithOffset.split(' ')
          const formattedDate = dateWithOffsetArray[1] + dateWithOffsetArray[2]
          Util.printLog('INFO', __filename, `dateWithOffset = ${formattedDate}`)
          const timetableEmbed = Util.getTimetableEmbed(
            formattedDate,
            true,
            true
          )
          channel.send({embeds: [timetableEmbed]})
        } catch (e) {
          return Util.printLog('info', __filename, e.stack)
        }
      }
    }

    const er = 60 - new Date().getSeconds()
    Util.printLog('info', __filename, `seconds until next minute:${er}`)
    const rer = er + '500'
    Util.printLog('info', __filename, `Modified wait time (str):${rer}`)
    const nRer = Number(rer)
    Util.printLog('info', __filename, `Modified wait time (num):${nRer}`)
    setTimeout(function () {
      checktime()
      setInterval(checktime, 60000)
      Util.printLog('info', __filename, 'Time message Interval set!')
    }, nRer)
    */
  }
}
