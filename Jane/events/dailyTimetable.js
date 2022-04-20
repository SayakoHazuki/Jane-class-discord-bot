const Evt = require('../core/e')
// 

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'ready')
  }

  async run () {
    /*
    const client = this.client
    const done = false
    logger.info(done)
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
          logger.info(`dateWithOffset = ${formattedDate}`)
          const timetableEmbed = Util.getTimetableEmbed(
            formattedDate,
            true,
            true
          )
          channel.send({embeds: [timetableEmbed]})
        } catch (e) {
          return logger.info(e.stack)
        }
      }
    }

    const er = 60 - new Date().getSeconds()
    logger.info(`seconds until next minute:${er}`)
    const rer = er + '500'
    logger.info(`Modified wait time (str):${rer}`)
    const nRer = Number(rer)
    logger.info(`Modified wait time (num):${nRer}`)
    setTimeout(function () {
      checktime()
      setInterval(checktime, 60000)
      logger.info('Time message Interval set!')
    }, nRer)
    */
  }
}
