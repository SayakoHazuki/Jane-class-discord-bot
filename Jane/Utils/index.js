const colorCode = require('./colorCode')
const terminal = require('./terminal')
const formatter = require('./formatting')
const splitter = require('./splitting')
const { InfoEmbed, ExceptionEmbed, MultiEmbed } = require('./embedBuilder')
const whatIsIt = require('./whatIsIt')
const LessonsSchedule = require('./getTimetable')
const getCovData = require('./getCovData')
const dmHandler = require('./handleDM')
const Sort = require('./sorting')
const tryDelete = require('./deleteCatching')

module.exports = class Util {
  /**
   * Constructs the Util class (when needed).
   * @param {Discord.Client} client
   */
  constructor (client) {
    this.client = client
  }

  /**
   * Set the color for console logging
   * @param {string} color The color to be set for logging
   * @returns Color code for the color (Sets logging to the color received)
   */
  static logColor (color) {
    return colorCode(color)
  }

  /**
   * Reset the color for console logging
   * @returns Color code for reset (Sets logging to no color formatting)
   */
  static resetColor () {
    return colorCode('reset')
  }

  /**
   * Print message to log
   * @param {string} type `INFO` `WARN` `ERR`
   * @param {string} message Message to be printed
   * @returns
   */
  static printLog (type, file, ...message) {
    return terminal.print(type, file, message)
  }

  /**
   * Format Number into x digits (string)
   * @param {Number} input Input
   * @param {Number} digit Digits for the output (default = 2)
   * @returns {string} Number in x digits
   */
  static formatNumDigit (input, digit) {
    if (digit) return formatter.numDigit(input, digit)
    return formatter.numDigit(input)
  }

  /**
   * Convert JS date into custom format
   * @param {Date} date the date to be formatted
   * @param {string} format the format
   * @returns {string} formatted time
   */
  static formatDate (date, format) {
    return formatter.time(date, format)
  }

  /**
   * Split send a string to fit Discord's 2000 char limit
   * @param {Discord.Message} message Message
   * @param {string} str String to be splitted
   * @param {string} code Code highlighting
   * @returns Nothing
   */
  static splitSend (message, str = 'undefined', code = 'none') {
    this.printLog('info', __filename, message.channel + str + code)
    splitter.splitCode(message, str, code)
  }

  /**
   * Creates Info Embed
   * @param {Discord.Message} message Message
   * @param {string} title Title of the embed
   * @param {Content} content Content of the embed (optional)
   * @returns Discord MessageEmbed (Information)
   */
  static InfoEmbed (message, title, content = false) {
    const emb = new InfoEmbed(message, title, content)
    return emb.embed
  }

  /**
   * Creates Error Embed
   * @param {Discord.Message} message Message
   * @param {string} title Title of the embed
   * @param {string} content Content of the embed (optional)
   * @returns Discord MessageEmbed (Error)
   */
  static errEmbed (message, title, content = false) {
    const emb = new ExceptionEmbed(message, title, content)
    return emb.embed
  }

  /**
   * Determine type of something
   * @param {any} any The thing to be tested
   * @returns typeof (any)
   */
  static whatsIt (any) {
    return whatIsIt(any)
  }

  /**
   * Handle an error
   * @param {Error} e Error to be handled
   * @returns Nothing
   */
  static handleErr (e) {
    this.printLog('err', __filename, e.message)
    this.printLog('err', __filename, e.stack)
  }

  /**
   * Send a multi-paged Embed
   * @param {Discord.Message} message Message
   * @param {Array} pages Array of Discord MessageEmbeds
   * @param {Array} emoList Array of emojis (Optional)
   * @param {Number} timeout Timeout in ms (Default = 120000)
   * @returns Nothing
   */
  static MultiEmbed (message, pages, emoList = ['⏪', '⏩'], timeout = 120000) {
    return MultiEmbed(message, pages, emoList, timeout)
  }

  /**
   * Get Timetable Embed
   * @param {string} dateToRead Date in ddmmm format
   * @param {string|boolean} timeOfSchool Set to false to not show time of period; Set to true to determine the time automatically; Can also be set to AM, PM, normal or summer manualy
   * @param {boolean} showLinks Whether to show online class links or not
   * @returns Discord MessageEmbed of timetable
   */
  static getTimetableEmbed (
    dateToRead,
    timeOfSchool = false,
    showLinks = false,
    sClass = 'unknown'
  ) {
    const timetable = new LessonsSchedule(
      dateToRead,
      timeOfSchool,
      showLinks,
      sClass
    )
    return timetable.embed || undefined
  }

  /**
   * get Covid data and run function
   * @param {function} callback Callback function to be executed after getting the data
   * @returns Nothing
   */
  static getCovidData (callback) {
    getCovData(callback)
  }

  static handleDM (message, client) {
    dmHandler(message, client)
  }

  /**
   * Sort object by value
   * @param {{}} obj Object to sort
   * @returns {{}} Sorted object
   */
  static sortObjectByValue (object = {}) {
    return Sort.objectByValue(object)
  }

  /**
   * Sort Array of Objects by object property
   * @param {Array} array Array to sort
   * @param {string} property Property to sort
   * @returns Sorted array
   */
  static sortArrayOfObjects (array = [], property = '') {
    return Sort.arrayOfObjectByProp(array, property)
  }

  /**
   * Converts JavaScript Dates into Discord Timestamp
   * @param {Date} date
   * @param {string} format
   * @returns {string} Discord Timestamp
   */
  static getDiscordTimestamp (date = new Date(), format = 'D') {
    return `<t:${Math.round(date.getTime() / 1000)}:${format}>`
  }

  static discordLog (content) {
    const ch = this.client.channels.fetch('921544138887929886')
    return ch.send(content)
  }

  static tryDelete (message) {
    return tryDelete(message)
  }

  static randomFromArray (items) {
    return items[Math.floor(Math.random() * items.length)]
  }
}
